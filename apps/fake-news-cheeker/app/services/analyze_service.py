from datetime import datetime
from typing import Dict, List, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from ..ai.deepseek_client import DeepSeekClient, NoJSONInResponseError
from ..utils.logger import logger

class AnalyzeService:
    CURRENT_DATE = datetime.now().strftime("%Y-%m-%d")

    SYSTEM_PROMPT = f"""
Today's date is {CURRENT_DATE}.

You are an expert fact-checking analyst. Your task is to evaluate the following claim using the provided article. Consider the context and category of the article, and determine whether the article supports, refutes, partially supports, or does not address the claim.

Note: The claim and article may be in any language, including Arabic. Respond in the same language as the claim if possible.

Instructions:
- Carefully read the claim and the article.
- Assess if the article is relevant to the claim.
- Judge the level of support the article provides for the claim:
    - "True": The article clearly supports the claim.
    - "False": The article clearly refutes the claim.
    - "Partial": The article provides partial or ambiguous support/refutation.
    - "Unknown": The article does not address the claim or is irrelevant.
- Assign a confidence score (0-100) based on the strength and clarity of the evidence.
- Briefly explain your reasoning in 1-2 sentences.
- Mark the article as "authoritative" if it is from a well-known, official, or primary source (e.g., NASA, WHO, Reuters, government agencies, peer-reviewed journals).

Your response MUST be ONLY the following JSON structure, with no extra text, markdown, or explanation:
{{
  "relevant": boolean,                // Is the article relevant to the claim?
  "support": "True"|"False"|"Partial"|"Unknown", // Level of support
  "confidence": integer,              // 0-100
  "reason": "string",                 // Brief explanation (1-2 sentences), depending on the language of the claim, arabic, Turkish, French, English, etc
  "authoritative": boolean            // Is the source authoritative?
}}
"""

    def __init__(self):
        self.ai_client = DeepSeekClient()

    def analyze_source(self, claim: str, article: Dict) -> Dict:
        import re
        # Log claim and article content if claim contains Arabic characters
        if re.search(r'[\u0600-\u06FF]', claim):
            logger.info(f"[ARABIC] Claim: {claim}")
            logger.info(f"[ARABIC] Article Title: {article.get('title', '')}")
            logger.info(f"[ARABIC] Article Content: {article.get('content', '')[:500]}")
        prompt = self._build_analysis_prompt(claim, article)
        try:
            raw_response = self.ai_client.ask(prompt, system_prompt=self.SYSTEM_PROMPT)
            parsed = self.ai_client._parse_response(raw_response, article)
            if "authoritative" not in parsed or parsed["authoritative"] is None:
                authoritative_domains = ["nasa.gov", "who.int", "reuters.com", "apnews.com", "bbc.co.uk"]
                parsed["authoritative"] = any(domain in article.get("source", "").lower() for domain in authoritative_domains)
            if "nasa.gov" in article.get("source", "").lower():
                parsed["authoritative"] = True
            logger.info(f"Analyzed {article.get('source')} → support={parsed['support']} conf={parsed['confidence']} auth={parsed.get('authoritative')}")
            return parsed
        except NoJSONInResponseError:
            # Retry once
            retry_prompt = (
                prompt + "\n\nYou MUST return only JSON. No markdown or extra explanation."
            )
            try:
                raw_retry = self.ai_client.ask(retry_prompt, system_prompt=self.SYSTEM_PROMPT)
                return self.ai_client._parse_response(raw_retry, article)
            except NoJSONInResponseError:
                logger.error(f"Failed to parse LLM response for {article.get('url')}")
                return {
                    **article,
                    "relevant": False,
                    "support": "Unknown",
                    "confidence": 0,
                    "reason": "Failed to parse JSON",
                    "authoritative": False
                }

    def analyze_sources(self, claim: str, articles: List[Dict], max_workers: int = 5) -> List[Dict]:
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(self.analyze_source, claim, article) for article in articles]
            return [f.result() for f in futures]

    def compute_final_verdict(self, claim: str, raw_results: List[Dict]) -> Dict:
        relevant = self._filter_and_weight_sources(raw_results)
        print("Relevant sources for override:", relevant)
        for src in relevant:
            print(f"Source: {src.get('source')}, Support: {src.get('support')}, Confidence: {src.get('confidence')}, Authoritative: {src.get('authoritative')}")
            if src["support"] == "True" and src["confidence"] >= 80 and src.get("authoritative"):
                print("Authoritative override triggered!")
                return {
                    "verdict": "True",
                    "confidence": float(src["confidence"]),
                    "explanation": f"This claim is confirmed by the authoritative source {src['source']} with high confidence.",
                    "conclusion": "✅ This claim is strongly supported by a top-tier source.",
                    "category": self._classify_category(claim),
                    "sources": raw_results
                }

        # 🧠 Standard verdict logic
        verdict, confidence = self._calculate_verdict(relevant)
        explanation = self._generate_explanation(claim, verdict, relevant)
        conclusion = self._generate_conclusion(verdict, confidence, relevant, claim)

        if not explanation or not explanation.strip():
            explanation = "The sources do not provide a clear consensus on this claim."

        return {
            "verdict": verdict,
            "confidence": confidence,
            "explanation": explanation,
            "conclusion": conclusion,
            "category": self._classify_category(claim),
            "sources": raw_results
        }

    def _build_analysis_prompt(self, claim: str, article: Dict) -> str:
        return (
            f"### CLAIM:\n{claim}\n\n"
            f"### ARTICLE:\nTitle: {article.get('title', 'Untitled')}\n"
            f"Date: {article.get('date', 'Unknown')}\n"
            f"Source: {article.get('source', 'Unknown')}\n"
            f"### CONTENT:\n{article.get('content', '')[:3000]}"
        )

    def _filter_and_weight_sources(self, sources: List[Dict]) -> List[Dict]:
        def is_recent(date_str: Optional[str]) -> bool:
            try:
                if not date_str or date_str.lower() == "unknown":
                    return False
                dt = datetime.strptime(date_str, "%Y-%m-%d")
                return (datetime.now() - dt).days <= 365
            except Exception:
                return False

        filtered = []
        for src in sources:
            if src.get("relevant") and src.get("confidence", 0) > 30:
                temporal_weight = self._calculate_temporal_weight(src.get("date"), is_recent(src.get("date")))
                filtered.append({**src, "temporal_weight": temporal_weight})
        return filtered

    def _calculate_temporal_weight(self, article_date: Optional[str], is_recent_claim: bool) -> float:
        if not article_date or article_date.lower() == "unknown":
            return 0.6
        try:
            pub_date = datetime.strptime(article_date, "%Y-%m-%d")
            age_days = (datetime.now() - pub_date).days

            if is_recent_claim:
                if age_days <= 365: return 1.0
                elif age_days <= 730: return 0.8
                elif age_days <= 1825: return 0.4
                else: return 0.2
            else:
                if age_days <= 1825: return 1.0
                elif age_days <= 3650: return 0.9
                elif age_days <= 7300: return 0.8
                else: return 0.7
        except ValueError:
            return 0.5

    def _source_weight(self, source: str) -> float:
        credibility = {
            "reuters": 1.3, "ap": 1.3, "bbc": 1.3,
            "nytimes": 1.2, "washingtonpost": 1.2, "nasa": 1.2,
            "who": 1.2, "nature": 1.2, "science": 1.1,
            "nationalgeographic": 1.1, "cnn": 1.1, "generic": 1.0
        }
        return credibility.get(source.lower(), 1.0)

    def _calculate_verdict(self, sources: List[Dict]) -> Tuple[str, float]:
        weights = [self._source_weight(s["source"]) * s["temporal_weight"] for s in sources]
        support_map = {"True": 1.0, "Partial": 0.5, "False": 0.0, "Unknown": 0.0}
        scores = [support_map.get(s["support"], 0.0) for s in sources]
        confs = [s["confidence"] for s in sources]

        # PATCH: Handle empty or zero weights robustly
        if not weights or sum(weights) == 0:
            return "Uncertain", 0.0

        weighted_support = np.average(scores, weights=weights)
        weighted_confidence = np.average(confs, weights=weights)

        if weighted_support >= 0.75:
            return "True", float(weighted_confidence)
        elif weighted_support >= 0.4:
            return "Partial", float(weighted_confidence * 0.8)
        elif weighted_support > 0.1:
            return "Uncertain", float(weighted_confidence * 0.5 + 5)
        return "False", float(weighted_confidence * 0.3)

    def _generate_explanation(self, claim: str, verdict: str, sources: List[Dict]) -> str:
        total = len(sources)
        count = lambda val: sum(1 for s in sources if s["support"] == val)

        base = f"Regarding '{claim}', the verdict is '{verdict}' based on {total} relevant sources. "

        if verdict == "True":
            return base + f"{count('True')} sources strongly support it and {count('Partial')} provide partial support."
        elif verdict == "Partial":
            return base + f"{count('True')} support, {count('Partial')} partial, and {count('False')} contradict the claim."
        elif verdict == "Uncertain":
            return base + f"Inconclusive evidence: {count('True')} support, {count('Partial')} partial, {count('False')} contradict."
        else:
            return base + f"{count('False')} sources contradict the claim."

    def _generate_conclusion(self, verdict: str, confidence: float, sources: List[Dict], claim: str) -> str:
        top_source = max(sources, key=lambda s: s.get("confidence", 0), default=None)
        if verdict == "True":
            return "✅ This claim is supported by credible sources." if confidence < 80 else "✅ Strong evidence confirms this claim."
        elif verdict == "Partial":
            return "🟡 The claim is partially supported, with mixed or uncertain evidence."
        elif verdict == "Uncertain":
            if top_source and top_source.get("support") in ["True", "Partial"]:
                return "❓ Some sources suggest support, but overall evidence is weak."
            else:
                return "🔍 We couldn't definitively verify this claim due to lack of consistent evidence."
        else:
            return "❌ Most sources contradict this claim."

    def _classify_category(self, claim: str) -> str:
        lower = claim.lower()
        if "nasa" in lower or "mars" in lower:
            return "science"
        categories = {
            "health": ["covid", "vaccine", "health", "disease", "medical"],
            "politics": ["election", "government", "president", "senate", "law"],
            "technology": ["ai", "robot", "tech", "innovation", "computer"],
            "science": ["mars", "space", "nasa", "discovery", "research", "water"],
            "finance": ["stock", "market", "economy", "dollar", "bank"]
        }
        print("Classifying claim:", claim)
        print("Lowercased:", lower)
        for cat, keywords in categories.items():
            print(f"Checking category {cat} with keywords {keywords}")
            if any(k in lower for k in keywords):
                print(f"Matched category: {cat}")
                return cat
        print("No match, returning 'general'")
        return "general"

    def _empty_response(self, claim: str) -> Dict:
        return {
            "verdict": "Uncertain",
            "confidence": 0.0,
            "explanation": f"No sources provided to verify: '{claim}'",
            "conclusion": "No relevant sources were found to verify this claim.",
            "category": self._classify_category(claim),
            "sources": []
        }
