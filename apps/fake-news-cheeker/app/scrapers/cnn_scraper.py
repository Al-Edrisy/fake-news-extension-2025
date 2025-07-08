from .base_scraper import BaseScraper, NewsArticle
from playwright.async_api import Locator, Page
from typing import List, Optional
import logging

class CNNScraper(BaseScraper):
    """
    Scraper for CNN news articles using Playwright's async API.
    """
    def is_list_page(self) -> bool:
        """
        Checks if the current page is a CNN search results list page.
        """
        # This method may need to be async if it uses Playwright calls
        # But if self.page is set and query_selector is async, this should be async
        raise NotImplementedError("is_list_page should be async if using async Playwright.")

    async def async_is_list_page(self) -> bool:
        """
        Async version: Checks if the current page is a CNN search results list page.
        """
        return await self.page.query_selector(".search__results") is not None

    async def scrape_list_page(self) -> List[NewsArticle]:
        """
        Scrapes a CNN search results list page for articles.
        """
        articles: List[NewsArticle] = []
        try:
            cards = await self.page.query_selector_all(".search__results .search__result")
            for card in cards:
                article = await self._parse_card(card)
                if article:
                    articles.append(article)
        except Exception as e:
            logging.exception(f"Error scraping CNN list page: {e}")
        return articles

    async def _parse_card(self, card) -> Optional[NewsArticle]:
        """
        Parses a single article card from the CNN search results.
        """
        try:
            link_el = await card.query_selector("a.search__result-link")
            if not link_el:
                return None

            title_raw = await link_el.text_content()
            title = title_raw.strip() if isinstance(title_raw, str) else ""
            url = await link_el.get_attribute("href")

            date_el = await card.query_selector(".search__result-publish-date")
            date_raw = await date_el.text_content() if date_el else ""
            date = date_raw.strip() if isinstance(date_raw, str) else ""

            desc_el = await card.query_selector(".search__result-snippet")
            desc_raw = await desc_el.text_content() if desc_el else ""
            description = desc_raw.strip() if isinstance(desc_raw, str) else ""

            return NewsArticle(
                title=title,
                url=url,
                source="CNN",
                date=date,
                description=description
            )
        except Exception as e:
            logging.exception(f"Error parsing CNN card: {e}")
            return None

    async def scrape_article_page(self) -> Optional[NewsArticle]:
        """
        Scrapes a CNN article page for its content.
        """
        try:
            title_el = await self.page.query_selector("h1.pg-headline")
            title_raw = await title_el.text_content() if title_el else None
            title = title_raw.strip() if isinstance(title_raw, str) else "No title"

            date_el = await self.page.query_selector(".timestamp")
            date_raw = await date_el.text_content() if date_el else ""
            date = date_raw.strip() if isinstance(date_raw, str) else ""

            content_el = await self.page.query_selector(".article__content")
            if content_el:
                paragraphs = await content_el.query_selector_all("p.paragraph")
                content_parts = []
                for p in paragraphs:
                    text = await p.text_content()
                    stripped = text.strip() if isinstance(text, str) else ""
                    if stripped:
                        content_parts.append(stripped)
                content = "\n\n".join(content_parts)
            else:
                content = ""

            return NewsArticle(
                title=title,
                url=self.page.url,
                source="CNN",
                date=date,
                content=content
            )
        except Exception as e:
            logging.exception(f"Error scraping CNN article page: {e}")
            return None
