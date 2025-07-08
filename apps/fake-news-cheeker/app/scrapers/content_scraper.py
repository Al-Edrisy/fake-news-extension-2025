import os
import json
import logging
import requests
import re
from urllib.parse import urljoin
from dataclasses import dataclass
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from readability import Document as ReadabilityDocument
from typing import List, Optional

# Load environment variables
load_dotenv()

logger = logging.getLogger("news_scraper")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CX = os.getenv("GOOGLE_CX")
PLAYWRIGHT_TIMEOUT = 15000  # 30 seconds


@dataclass
class NewsArticle:
    title: str
    url: str
    source: str
    date: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None


class NewsScraper:
    def __init__(self, headless: bool = True, timeout: int = PLAYWRIGHT_TIMEOUT):
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(
            headless=headless,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        self.context = self.browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/91.0.4472.124 Safari/537.36"
            )
        )
        self.page = self.context.new_page()
        self.page.set_default_timeout(timeout)
        self.timeout = timeout

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()

    def close(self):
        try:
            self.page.close()
            self.context.close()
            self.browser.close()
            self.playwright.stop()
        except Exception as e:
            logger.warning(f"Error during closing resources: {e}")

    def load_page(self, url: str, retries: int = 2) -> bool:
        for attempt in range(1, retries + 1):
            try:
                response = self.page.goto(url, timeout=self.timeout)
                if response and response.ok:
                    return True
            except PlaywrightTimeoutError:
                logger.warning(f"Timeout loading {url} (attempt {attempt}/{retries})")
            except Exception as e:
                logger.error(f"Error loading page {url}: {e}")

            if attempt < retries:
                self.page.wait_for_timeout(2000)  # Wait 2 seconds before retry
        return False

    def scrape(self, url: str) -> List[NewsArticle]:
        if not self.load_page(url):
            logger.error(f"Failed to load page: {url}")
            return []

        if self.is_list_page():
            return self.scrape_list_page()
        else:
            article = self.scrape_article_page()
            return [article] if article else []

    def is_list_page(self) -> bool:
        try:
            article_count = len(self.page.query_selector_all("article, .article, .post, .card"))
            return article_count > 3
        except Exception as e:
            logger.error(f"Error detecting list page: {e}")
            return False

    def scrape_list_page(self) -> List[NewsArticle]:
        articles = []
        selectors = ["article", ".article", ".post", ".card", ".item"]

        try:
            for selector in selectors:
                items = self.page.query_selector_all(selector)
                if items:
                    for item in items:
                        art = self._parse_list_item(item)
                        if art:
                            articles.append(art)
                    break
        except Exception as e:
            logger.error(f"Error scraping list page: {e}")

        return articles

    def _parse_list_item(self, item) -> Optional[NewsArticle]:
        try:
            link_el = item.query_selector("a")
            if not link_el:
                return None

            title = link_el.text_content().strip() if link_el.text_content() else "No title"
            url = link_el.get_attribute("href")
            if url and not url.startswith("http"):
                url = urljoin(self.page.url, url)

            return NewsArticle(
                title=title,
                url=url,
                source="list_page"
            )
        except Exception as e:
            logger.error(f"Error parsing list item: {e}")
            return None

    def scrape_article_page(self) -> Optional[NewsArticle]:
        try:
            title_el = self.page.query_selector("h1")
            if title_el is not None:
                title_text = title_el.text_content()
                title = title_text.strip() if title_text else "No title"
            else:
                title = "No title"

            content = self.extract_article_content()

            return NewsArticle(
                title=title,
                url=self.page.url,
                source="article",
                content=content
            )
        except Exception as e:
            logger.error(f"Error scraping article page: {e}")
            return None

    def extract_article_content(self) -> str:
        try:
            html = self.page.content()
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
                'related', 'comments', 'share', 'social', 'newsletter'
            ]
            for cls in non_content_classes:
                for div in soup.find_all('div', class_=cls):
                    div.decompose()

            text = soup.get_text(separator='\n')
            text = re.sub(r'\n\s*\n', '\n\n', text)
            text = re.sub(r'[ \t]+', ' ', text).strip()

            return text
        except Exception as e:
            logger.error(f"Error extracting article content: {e}")
            return ""


def google_search_by_query(query: str, max_results: int = 5, lang: str = "lang_en") -> List[str]:
    if not (GOOGLE_API_KEY and GOOGLE_CX):
        raise RuntimeError("Set GOOGLE_API_KEY and GOOGLE_CX in .env")

    try:
        resp = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params={
                "key": GOOGLE_API_KEY,
                "cx": GOOGLE_CX,
                "q": query,
                "num": max_results,
                "lr": lang,
                "safe": "active"
            },
            timeout=15
        )
        resp.raise_for_status()
        items = resp.json().get("items", [])
        return [item["link"] for item in items if "link" in item]
    except Exception as e:
        logger.error(f"Google search API error: {e}")
        return []
