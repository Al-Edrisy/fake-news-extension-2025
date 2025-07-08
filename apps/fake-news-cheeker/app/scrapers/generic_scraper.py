from .base_scraper import BaseScraper, NewsArticle
from bs4 import BeautifulSoup
from readability import Document as ReadabilityDocument
from typing import List, Optional
import re
import logging

logger = logging.getLogger(__name__)


class GenericScraper(BaseScraper):
    MAX_CONTENT_LENGTH = 10000

    async def is_list_page(self) -> bool:
        elements = await self.page.query_selector_all("article, .article, .post, .card")
        return len(elements) > 3

    async def scrape_list_page(self) -> List[NewsArticle]:
        articles = []
        for selector in ["article", ".article", ".post", ".card", ".item"]:
            items = await self.page.query_selector_all(selector)
            if items:
                for item in items:
                    if article := await self.parse_list_item(item):
                        articles.append(article)
                break
        return articles

    async def parse_list_item(self, item) -> Optional[NewsArticle]:
        try:
            link = await item.query_selector("a")
            if not link: return None

            title = await link.text_content()
            title = title.strip() if title else "No title"

            url = await link.get_attribute("href")
            if url and not url.startswith("http"):
                page_url = self.page.url
                if url:
                    if url.startswith("/"):
                        url = page_url.rstrip("/") + url
                else:
                    return None

                return NewsArticle(title=title, url=url, source="generic")
        except Exception as e:
            logger.error(f"Error parsing list item: {str(e)}")
            return None

    async def scrape_article_page(self) -> Optional[NewsArticle]:
        try:
            title_el = await self.page.query_selector("h1")
            if title_el:
                title = await title_el.text_content()
                title = title.strip() if title else "No title"
            else:
                title = "No title"

            content = await self.extract_article_content()

            return NewsArticle(
                title=title,
                url=self.page.url,
                source="generic",
                content=content
            )
        except Exception as e:
            logger.error(f"Error scraping article: {str(e)}")
            return None

    async def extract_article_content(self) -> str:
        try:
            html = await self.page.content()
            doc = ReadabilityDocument(html)
            content_html = doc.summary()

            soup = BeautifulSoup(content_html, 'html.parser')

            # Remove unwanted elements
            for element in soup(['script', 'style', 'header', 'footer', 'nav',
                                 'aside', 'form', 'button', 'iframe', 'noscript']):
                element.decompose()

            # Remove non-content classes
            non_content_classes = [
                'ad', 'ads', 'advertisement', 'banner', 'sidebar',
                'related', 'comments', 'share', 'social', 'newsletter',
                'menu', 'footer', 'header', 'nav', 'cookie'
            ]
            for div in soup.find_all('div', class_=non_content_classes):
                div.decompose()

            # Extract text
            text = soup.get_text()

            # Clean and truncate
            text = re.sub(r'\n\s*\n', '\n\n', text)
            text = re.sub(r'[ \t]+', ' ', text).strip()

            # Remove common boilerplate
            text = re.sub(r'©\s*\S+', '', text)
            text = re.sub(r'All rights reserved\.?', '', text)
            text = re.sub(r'Sign up for .+ newsletters?', '', text)

            return text[:self.MAX_CONTENT_LENGTH]
        except Exception as e:
            logger.error(f"Content extraction failed: {str(e)}")
            return ""
