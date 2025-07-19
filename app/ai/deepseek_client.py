import json
import re
import time
from typing import Optional, Dict
from huggingface_hub import InferenceClient
from functools import wraps
from ..config.settings import HF_TOKEN
from ..utils.logger import logger

def log_and_retry(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        max_retries = kwargs.pop("max_retries", 3)
        for attempt in range(max_retries):
            try:
                return fn(*args, **kwargs)
            except Exception as e:
                logger.warning(f"[DeepSeek] Attempt {attempt+1}/{max_retries} failed: {e}")
                time.sleep(1.5 ** attempt)
        logger.error("[DeepSeek] All retries failed")
        raise RuntimeError("DeepSeek service unavailable after retries")
    return wrapper

class NoJSONInResponseError(Exception):
    pass

class DeepSeekClient:
    def __init__(self):
        self.client = InferenceClient(token=HF_TOKEN)

    @log_and_retry
    def ask(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        raw_response = self.client.chat_completion(
            messages=messages,
            model="deepseek-ai/DeepSeek-V3",
            max_tokens=512,
            temperature=0.8,
        )

        # Normalize output depending on HF client response type
        if isinstance(raw_response, dict):
            # Try to extract the 'choices' field if present, else dump the dict
            if "choices" in raw_response and raw_response["choices"]:
                choice = raw_response["choices"][0]
                content = choice.get("message", {}).get("content") or choice.get("content")
                if content:
                    return content
            return json.dumps(raw_response)
        if isinstance(raw_response, str):
            return raw_response
        if hasattr(raw_response, "choices") and raw_response.choices:
            choice = raw_response.choices[0]
            content = getattr(getattr(choice, "message", choice), "content", None)
            return content or str(raw_response)

        return str(raw_response)

    def _parse_response(self, response: str, article: Dict) -> Dict:
        try:
            # Try to extract JSON from a ```json ... ``` code block first
            code_block = re.search(r"```json\s*([\s\S]+?)```", response)
            if code_block:
                json_str = code_block.group(1)
            else:
                # Fallback: extract first {...} block
                match = re.search(r'(\{.*\})', response, re.DOTALL)
                if match:
                    json_str = match.group(1)
                else:
                    logger.error(f"No JSON found in LLM response: {response!r}")
                    raise NoJSONInResponseError("No JSON found in response")
            data = json.loads(json_str)
        except Exception as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}\nResponse: {response!r}")
            raise

        return {
            **article,
            "relevant": bool(data.get("relevant", False)),
            "support": data.get("support", "Unknown").capitalize(),
            "confidence": max(0.0, min(100.0, float(data.get("confidence", 0.0)))),
            "reason": data.get("reason", "").strip()
        }