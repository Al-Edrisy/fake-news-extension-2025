# app/__init__.py

from .config import settings
from .database import get_db, init_db
from .utils.logger import logger
from .models.claim_model import Claim
from .ai.deepseek_client import DeepSeekClient
from .controllers.claim_controller import ClaimController
from .services.claim_service import ClaimService
from .services.scrape_service import ScrapeService
from .scrapers.content_scraper import NewsScraper, NewsArticle, google_search_by_query
from .validators.claim_validator import validate_claim_payload
from .core.error_handler import handle_error
from .models.claim_model import Claim
from .models.source import Source
from .models.analysis import Analysis
from .routes import claim_bp, search_bp, analyze_bp
# Optional: If you want these available when importing just 'app'
__all__ = [
    'Source', 'Analysis',
    'settings',
    'get_db', 'init_db',
    'analyze_bp', 'logger',
    'Claim',
    'DeepSeekClient',
    'ClaimController',
    'ClaimService', 'ScrapeService',
    'NewsScraper', 'NewsArticle', 'google_search_by_query',
    'validate_claim_payload',
    'handle_error'
]

from flask import Flask
from .database import init_db
from .utils.logger import logger


def create_app():
    app = Flask(__name__)

    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Register blueprints
    from .routes.claim_routes import claim_bp
    from .routes.search_routes import search_bp
    from .routes.analyze_routes import analyze_bp

    app.register_blueprint(claim_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(analyze_bp)

    return app
