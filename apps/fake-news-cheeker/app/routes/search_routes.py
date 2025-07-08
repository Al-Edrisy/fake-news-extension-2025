from flask import Blueprint, request, jsonify
from ..services.scrape_service import ScrapeService
from ..services.google_search_service import GoogleSearchService
from ..core.error_handler import handle_error
from ..utils.logger import logger
import time
import asyncio

search_bp = Blueprint('search', __name__, url_prefix='/api/search')
scrape_service = ScrapeService()
google_service = GoogleSearchService()

# Simple cache implementation for async functions
cache = {}
CACHE_DURATION = 300  # 5 minutes

def classify_category(claim, articles=None):
    if articles is None:
        articles = []
    categories = {
        "health": ["covid", "vaccine", "health", "disease", "medical", "hospital", "doctor", "virus", "pandemic"],
        "politics": ["election", "government", "president", "senate", "law", "minister", "parliament", "vote", "policy"],
        "technology": ["ai", "robot", "tech", "innovation", "computer", "software", "hardware", "internet", "app"],
        "science": ["mars", "space", "nasa", "discovery", "research", "astronomy", "physics", "biology", "chemistry"],
        "finance": ["stock", "market", "economy", "dollar", "bank", "crypto", "bitcoin", "investment", "inflation"],
        "sports": ["football", "soccer", "basketball", "olympics", "athlete", "tournament", "match", "goal", "score"],
        "entertainment": ["movie", "music", "celebrity", "tv", "film", "actor", "singer", "show", "award"],
        "environment": ["climate", "environment", "pollution", "global warming", "recycle", "carbon", "emission", "wildlife"]
    }
    text = claim.lower()
    for article in articles:
        text += " " + article.get("title", "").lower()
        text += " " + article.get("content", "").lower()
    for category, keywords in categories.items():
        if any(keyword in text for keyword in keywords):
            return category
    return "general"

@search_bp.route('/web', methods=['POST'])
@handle_error
def web_search():  # Removed async decorator
    start_time = time.time()
    data = request.get_json() or {}
    query = data.get("query", "").strip()

    if not query:
        return jsonify({"error": "Query is required"}), 400

    max_results = min(int(data.get("max_results", 5)), 20)
    cache_key = f"{query}-{max_results}"

    # Check cache first
    if cache_key in cache:
        cache_time, cached_data = cache[cache_key]
        if time.time() - cache_time < CACHE_DURATION:
            logger.debug(f"Using cached results for: {query}")
            articles = cached_data
        else:
            del cache[cache_key]  # Remove expired cache
    else:
        # Get fresh results if not in cache
        articles = google_service.search(query, max_results)
        cache[cache_key] = (time.time(), articles)

    processing_time = time.time() - start_time

    return jsonify({
        "status": "success",
        "query": query,
        "results_count": len(articles),
        "processing_time": f"{processing_time:.2f} seconds",
        "articles": [{
            "title": a.get("title", ""),
            "url": a.get("url", ""),
            "source": a.get("source", "unknown"),
            "snippet": a.get("snippet", ""),
            "date": a.get("date", ""),
            "category": classify_category(query, articles),
        } for a in articles]
    })
