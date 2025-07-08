from dataclasses import dataclass
from typing import List, Optional
from playwright.async_api import Page

@dataclass
class NewsArticle:
    title: str
    url: str
    source: str
    date: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None

class BaseScraper:
    def __init__(self, page: Page):
        self.page = page

    async def load_page(self, url: str, retries: int = 2) -> bool:
        for attempt in range(1, retries + 1):
            try:
                response = await self.page.goto(url, timeout=15000, wait_until="domcontentloaded")
                if response and response.ok:
                    return True
            except Exception:
                await self.page.wait_for_timeout(1500)
        return False

    async def scrape(self, url: str) -> List[NewsArticle]:
        if not await self.load_page(url):
            return []

        if await self.is_list_page():
            return await self.scrape_list_page()
        article = await self.scrape_article_page()
        return [article] if article else []

    async def is_list_page(self) -> bool:
        raise NotImplementedError()

    async def scrape_list_page(self) -> List[NewsArticle]:
        raise NotImplementedError()

    async def scrape_article_page(self) -> Optional[NewsArticle]:
        raise NotImplementedError()
