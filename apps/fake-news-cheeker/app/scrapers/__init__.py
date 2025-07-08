from .bbc_scraper import BBCScraper
from .cnn_scraper import CNNScraper
from .generic_scraper import GenericScraper
from typing import Type
from playwright.sync_api import Page
from .base_scraper import BaseScraper

def get_scraper_for_page(page: Page):
    def factory(url: str) -> Type[BaseScraper]:
        if "bbc." in url:
            return BBCScraper(page)
        elif "cnn." in url:
            return CNNScraper(page)
        return GenericScraper(page)
    return factory
