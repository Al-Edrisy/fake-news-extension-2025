import os
import requests
import logging
from dotenv import load_dotenv
from typing import List, Dict
import time
import concurrent.futures

load_dotenv()

logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CX = os.getenv("GOOGLE_CX")
CACHE_EXPIRY = 300  # 5 minutes

class GoogleSearchService:
    def __init__(self):
        self.cache = {}
        self.last_cleaned = time.time()

    def _clean_cache(self):
        """Remove expired cache entries"""
        current_time = time.time()
        if current_time - self.last_cleaned > 40:  # Clean every minute
            expired_keys = [k for k, (_, ts) in self.cache.items()
                            if current_time - ts > CACHE_EXPIRY]
            for key in expired_keys:
                del self.cache[key]
            self.last_cleaned = current_time

    def search(self, query: str, max_results: int = 3, lang: str = None) -> List[Dict]:
        if not (GOOGLE_API_KEY and GOOGLE_CX):
            raise RuntimeError("GOOGLE_API_KEY and GOOGLE_CX must be set in .env")

        # Check cache first
        cache_key = f"{query}-{max_results}-{lang or 'auto'}"
        self._clean_cache()

        if cache_key in self.cache:
            logger.debug(f"Using cached results for: {query}")
            return self.cache[cache_key][0]

        try:
            logger.info(f"Searching Google: {query}")
            start_time = time.time()

            # Use concurrent requests for multiple pages
            results = []
            pages = (max_results // 10) + 1
            with concurrent.futures.ThreadPoolExecutor() as executor:
                futures = []
                for page in range(1, pages + 1):
                    futures.append(
                        executor.submit(
                            self._search_page,
                            query,
                            min(10, max_results - (page - 1) * 10),
                            lang,
                            page
                        )
                    )

                for future in concurrent.futures.as_completed(futures):
                    results.extend(future.result())

            # Cache results
            self.cache[cache_key] = (results, time.time())

            logger.info(f"Found {len(results)} results in {time.time() - start_time:.2f}s")
            return results[:max_results]
        except Exception as e:
            logger.error(f"Google Search API error: {e}")
            return []

    def _search_page(self, query: str, num: int, lang: str = None, page: int = 1) -> List[Dict]:
        """Search a single page of results"""
        try:
            params = {
                "key": GOOGLE_API_KEY,
                "cx": GOOGLE_CX,
                "q": query,
                "num": num,
                "start": (page - 1) * 10 + 1,
                "safe": "active"
            }
            if lang:
                params["lr"] = lang
            response = requests.get(
                "https://www.googleapis.com/customsearch/v1",
                params=params,
                timeout=5
            )
            response.raise_for_status()
            print("GOOGLE API RAW RESPONSE:", response.text)
            data = response.json()

            results = []
            for item in data.get("items", []):
                results.append({
                    "url": item.get("link"),
                    "title": item.get("title"),
                    "snippet": item.get("snippet"),
                    "date": item.get("pagemap", {}).get("metatags", [{}])[0].get("article:published_time", "")
                })

            return results
        except Exception as e:
            logger.warning(f"Google Search page {page} error: {e}")
            return []
