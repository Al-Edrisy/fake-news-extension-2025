import asyncio
import time
import logging
import re
from typing import List, Dict, Optional, Tuple
import httpx
from selectolax.parser import HTMLParser
from urllib.parse import urlparse
from ..scrapers import get_scraper_for_page
from ..services.google_search_service import GoogleSearchService
from ..utils.logger import logger
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

@dataclass
class ScrapeResult:
    url: str
    content: str
    status: str = "success"
    error: Optional[str] = None
    sources: Optional[List[str]] = None

class ScrapeService:
    def __init__(self):
        self.search_service = GoogleSearchService()
        self.max_results = 5
        self.timeout = httpx.Timeout(10.0, connect=4.0)
        self.max_concurrent = 10
        self.max_retries = 1
        self.max_content_length = 8000
        self.client = httpx.AsyncClient(
            http2=True,
            timeout=self.timeout,
            limits=httpx.Limits(
                max_keepalive_connections=20,
                max_connections=30
            ),
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
            }
        )
        self.executor = ThreadPoolExecutor(max_workers=8)
        self.content_selectors = [
            "article",
            "[itemprop='articleBody']",
            ".article-content",
            ".post-content",
            ".entry-content",
            ".story-body",
            ".content-body",
            "main"
        ]
        self.boilerplate_patterns = [
            r'\b(?:Advertisement|Sponsored|Related:|Also Read:|Read more:|Sign up for)\b.*',
            r'©\s*\d{4}.*',
            r'All rights reserved.*',
            r'Terms of Use|Privacy Policy',
            r'Comments.*'
        ]

    async def search_news_async(
        self,
        query: str,
        max_results: Optional[int] = None,
        scrape_content: bool = True
    ) -> List[Dict]:
        """Search and scrape news articles with optimized parallel processing"""
        start_time = time.perf_counter()
        results = []
        
        try:
            # Get search results
            search_time = time.perf_counter()
            mx = min(max_results or self.max_results, 10)
            search_results = await asyncio.to_thread(
                self.search_service.search, query, mx
            )
            logger.info(f"Search completed in {time.perf_counter() - search_time:.2f}s")

            if not scrape_content:
                return self._format_search_results(search_results)

            # Parallel scraping
            scrape_time = time.perf_counter()
            urls = [r["url"] for r in search_results if r.get("url")]
            scraped = await self._parallel_scrape(urls)
            logger.info(f"Scraping completed in {time.perf_counter() - scrape_time:.2f}s")

            # Format results
            results = self._combine_results(search_results, scraped)
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            raise
        finally:
            logger.info(f"Total processing time: {time.perf_counter() - start_time:.2f}s")
            return results

    async def _parallel_scrape(self, urls: List[str]) -> Dict[str, ScrapeResult]:
        """Execute parallel scraping with rate limiting"""
        sem = asyncio.Semaphore(self.max_concurrent)
        
        async def scrape_task(url: str) -> ScrapeResult:
            async with sem:
                return await self._scrape_url(url)
                
        tasks = [scrape_task(url) for url in urls]
        results = await asyncio.gather(*tasks)
        return {result.url: result for result in results}

    async def _scrape_url(self, url: str) -> ScrapeResult:
        """Scrape and process a single URL"""
        try:
            # Fetch HTML
            resp = await self.client.get(url, follow_redirects=True)
            resp.raise_for_status()
            
            # Extract content
            content = await asyncio.get_running_loop().run_in_executor(
                self.executor,
                self._extract_content,
                resp.text,
                url
            )
            
            return ScrapeResult(url=url, content=content)
            
        except Exception as e:
            logger.warning(f"Failed to scrape {url}: {str(e)}")
            return ScrapeResult(
                url=url,
                content="",
                status="error",
                error=str(e),
                sources=[]
            )

    def _extract_content(self, html: str, url: str) -> str:
        """Optimized content extraction pipeline"""
        if not html or len(html) < 100:
            return ""

        try:
            # Generic extraction
            tree = HTMLParser(html)
            
            # Remove unwanted elements
            self._remove_unwanted_elements(tree)
            
            # Try content selectors in order
            content = self._try_content_selectors(tree)
            if content:
                return self._clean_content(content)
                
            # Fallback to body
            if body := tree.body:
                return self._clean_content(body.text(deep=True, separator="\n"))
                
            return ""
        except Exception as e:
            logger.error(f"Content extraction error for {url}: {str(e)}")
            return ""

    def _remove_unwanted_elements(self, tree):
        """Remove non-content elements from DOM"""
        for tag in ["script", "style", "noscript", "header", 
                   "footer", "nav", "aside", "form", "iframe"]:
            for node in tree.css(tag):
                node.decompose()
                
        for cls in ["ad", "sidebar", "related", "comments", 
                   "newsletter", "social", "share"]:
            for node in tree.css(f".{cls}"):
                node.decompose()

    def _try_content_selectors(self, tree) -> Optional[str]:
        """Try content selectors in priority order"""
        for selector in self.content_selectors:
            if node := tree.css_first(selector):
                text = node.text(deep=True, separator="\n").strip()
                if len(text) > 200:
                    return text
        return None

    def _clean_content(self, text: str) -> str:
        """Clean and normalize extracted content"""
        # Remove boilerplate
        for pattern in self.boilerplate_patterns:
            text = re.sub(pattern, '', text, flags=re.I)
            
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text[:self.max_content_length]

    def _format_search_results(self, search_results: List[Dict]) -> List[Dict]:
        """Format search results without scraping content"""
        return [{
            **r,
            "source": self._get_domain(r.get("url", "")),
            "content": ""
        } for r in search_results]

    def _combine_results(self, search_results: List[Dict], scraped: Dict[str, ScrapeResult]) -> List[Dict]:
        """Combine search results with scraped content"""
        results = []
        for r in search_results:
            url = r.get("url", "")
            scraped_result = scraped.get(url, ScrapeResult(url="", content="", status="unknown", sources=[]))
            results.append({
                **r,
                "source": self._get_domain(url),
                "content": scraped_result.content,
                "date": r.get("date", ""),
                "status": scraped_result.status,
                "sources": scraped_result.sources or []
            })
        return results

    def _get_domain(self, url: str) -> str:
        """Extract domain from URL"""
        if not url:
            return "unknown"
        domain = urlparse(url).netloc
        return domain.split(":")[0].lower()

    async def close(self):
        """Cleanup resources"""
        await self.client.aclose()
        self.executor.shutdown()

    def _calculate_verdict(self, sources: List[Dict]) -> Tuple[str, float]:
        # ... logic ...
        return verdict, confidence