from .base_scraper import BaseScraper, NewsArticle
from playwright.sync_api import Locator
from typing import List, Optional
import re
import logging

logger = logging.getLogger(__name__)


class BBCScraper(BaseScraper):
    MAX_CONTENT_LENGTH = 8000

    def is_list_page(self) -> bool:
        return self.page.query_selector("div[data-testid='topic-list']") is not None

    def scrape_list_page(self) -> List[NewsArticle]:
        articles = []
        cards = self.page.query_selector_all("div[data-testid='topic-list'] > div")
        for card in cards:
            if article := self._parse_card(card):
                articles.append(article)
        return articles

    def _parse_card(self, card: Locator) -> Optional[NewsArticle]:
        try:
            link_el = card.query_selector("a")
            if not link_el: return None

            title_el = link_el.query_selector("span[data-testid='card-headline']")
            if not title_el: return None
            title = title_el.text_content().strip()

            url = link_el.get_attribute("href")
            if not url.startswith("http"):
                url = f"https://www.bbc.com{url}"

            date_el = card.query_selector("time")
            date = date_el.get_attribute("datetime") if date_el else ""

            desc_el = card.query_selector("p[data-testid='card-description']")
            description = desc_el.text_content().strip() if desc_el else ""

            return NewsArticle(
                title=title,
                url=url,
                source="BBC",
                date=date,
                description=description
            )
        except Exception as e:
            logger.error(f"Card parsing failed: {str(e)}")
            return None

    def scrape_article_page(self) -> Optional[NewsArticle]:
        try:
            title_el = self.page.query_selector("h1#main-heading")
            title = title_el.text_content().strip() if title_el else "No title"

            date_el = self.page.query_selector("time[data-testid='timestamp']")
            date = date_el.get_attribute("datetime") if date_el else ""

            content_el = self.page.query_selector("article")
            paragraphs = content_el.query_selector_all("div[data-component='text-block']")
            content = "\n\n".join(p.text_content().strip() for p in paragraphs if p.text_content().strip())

            # Clean content
            content = re.sub(r'Advertisement\s*', '', content)
            content = re.sub(r'©\s*202[4-9] BBC\.', '', content)
            content = re.sub(r'Sign up for our .+ newsletter', '', content)
            content = content[:self.MAX_CONTENT_LENGTH]

            return NewsArticle(
                title=title,
                url=self.page.url,
                source="BBC",
                date=date,
                content=content
            )
        except Exception as e:
            logger.error(f"Article scraping failed: {str(e)}")
            return None
