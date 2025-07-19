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
    'handle_error',
    'create_app',
]

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from app.database import init_db
from app.routes import claim_bp, search_bp, analyze_bp
from app.routes.public_routes import public_bp

def create_app():
    # Load environment variables
    load_dotenv()
    # Initialize database
    init_db()
    # Create Flask app
    app = Flask(__name__)
    # Enable CORS
    CORS(app)

    # Register blueprints
    app.register_blueprint(claim_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(public_bp)

    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy"}), 200

    return app

# Explicit export for static analysis tools
create_app = create_app
