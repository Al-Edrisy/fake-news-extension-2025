from sqlalchemy.orm import Session
from ..models.claim_model import Claim
from ..models.source import Source
from ..models.analysis import Analysis
from ..database import get_db
from ..utils.logger import logger
from .scrape_service import ScrapeService
from .analyze_service import AnalyzeService
import uuid
import asyncio
import time
from typing import Dict

class ClaimService:
    def __init__(self):
        from .scrape_service import ScrapeService
        from .analyze_service import AnalyzeService
        self.scraper = ScrapeService()
        self.analyzer = AnalyzeService()

    def verify_claim(self, claim_text: str) -> dict:
        return asyncio.run(self.verify_claim_async(claim_text))

    async def verify_claim_async(self, claim_text: str) -> dict:
        timings = {}
        try:
            # Stage 1: Scraping
            start = time.perf_counter()
            articles = await self.scraper.search_news_async(claim_text, max_results=4, scrape_content=True)
            timings['scraping'] = time.perf_counter() - start

            # Stage 2: Parallel Analysis
            start = time.perf_counter()
            analysis_tasks = [
                asyncio.to_thread(self.analyzer.analyze_source, claim_text, art)
                for art in articles
            ]
            raw_results = await asyncio.gather(*analysis_tasks)
            # Use AnalyzeService's compute_final_verdict to get the final analysis and conclusion
            analysis = self.analyzer.compute_final_verdict(claim_text, raw_results)
            timings['analysis'] = time.perf_counter() - start

            # Stage 3: Database Operations
            start = time.perf_counter()
            with get_db() as db:
                claim = Claim(
                    id=uuid.uuid4(),
                    text=claim_text,
                    verdict=analysis["verdict"],
                    confidence=float(analysis["confidence"]),
                    explanation=analysis["explanation"],
                    conclusion=analysis["conclusion"],
                    category=analysis.get("category", "general")
                )
                db.add(claim)
                
                # Process sources
                for article in articles:
                    source = db.query(Source).filter(Source.url == article['url']).first()
                    if not source:
                        source = Source(
                            id=uuid.uuid4(),
                            url=article['url'],
                            domain=self._extract_domain(article['url']),
                            title=article.get('title', ''),
                            snippet=article.get('snippet', ''),
                            content=article.get('content', ''),
                            source_name=article.get('source', 'unknown')
                        )
                        db.add(source)
                    
                    analysis_entry = Analysis(
                        id=uuid.uuid4(),
                        claim_id=claim.id,
                        source_id=source.id,
                        support=article.get("support", "Uncertain"),
                        confidence=float(article.get("confidence", 50.0)),
                        reason=article.get("reason", ""),
                        analysis_text=article.get("content", "")[:500]
                    )
                    db.add(analysis_entry)
                
                db.commit()
                timings['database'] = time.perf_counter() - start

                return {
                    "status": "success",
                    "claim_id": claim.id,
                    "verdict": claim.verdict,
                    "confidence": claim.confidence,
                    "explanation": claim.explanation,
                    "conclusion": claim.conclusion,
                    "category": claim.category,
                    "sources": analysis["sources"],
                    "timings": timings
                }

        except Exception as e:
            logger.error(f"Claim verification failed: {str(e)}")
            return {
                "status": "error",
                "message": "Failed to verify claim",
                "error": str(e),
                "timings": timings,
                "sources": []
            }

    def _generate_human_conclusion(self, claim: str, analysis: dict) -> str:
        verdict = analysis["verdict"]
        confidence = analysis["confidence"]
        sources = analysis["sources"]
        sources_count = len([s for s in sources if s.get("relevant", True)])

        if verdict == "True":
            return (
                f"✅ Our verification confirms this claim is TRUE with {confidence:.0f}% confidence. "
                f"We found {sources_count} reliable source{'s' if sources_count != 1 else ''} supporting this."
            )
        elif verdict == "False":
            return (
                f"❌ This claim is FALSE according to our analysis ({confidence:.0f}% confidence). "
                f"We found {sources_count} source{'s' if sources_count != 1 else ''} contradicting this information."
            )
        elif verdict == "Partial":
            return (
                f"⚠️ This claim is PARTIALLY TRUE ({confidence:.0f}% confidence). "
                "Some elements are accurate but others may be misleading or lack context."
            )
        # Dynamic Uncertain message
        else:
            if not sources or sources_count == 0:
                return (
                    "🔍 We couldn't find any relevant sources to verify this claim. "
                    "There isn't enough information available from our news sources."
                )
            partial = sum(1 for s in sources if s.get("support") == "Partial")
            true = sum(1 for s in sources if s.get("support") == "True")
            false = sum(1 for s in sources if s.get("support") == "False")
            unknown = sum(1 for s in sources if s.get("support") in ["Unknown", "Uncertain"])
            if partial > 0:
                return (
                    f"❓ The available sources provide only partial or ambiguous support for this claim. "
                    f"{partial} source{'s' if partial != 1 else ''} suggest some elements may be true, but the evidence is not strong enough to confirm or refute the claim."
                )
            elif true > 0 and false > 0:
                return (
                    f"🤔 The sources are divided: {true} support, {false} contradict, and {unknown} are inconclusive. "
                    "There is no clear consensus among the sources, so we cannot definitively verify this claim."
                )
            elif true > 0:
                return (
                    f"❓ Some sources ({true}) suggest this claim might be true, but the evidence is weak or inconclusive. "
                    "More reliable information is needed to verify this claim."
                )
            elif false > 0:
                return (
                    f"❓ Some sources ({false}) contradict this claim, but the evidence is not strong enough to refute it definitively. "
                    "Overall, the claim remains unverified."
                )
            else:
                return (
                    "🔍 We couldn't definitively verify this claim. "
                    "There isn't enough reliable information available from our sources."
                )

    def _extract_domain(self, url: str) -> str:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.netloc