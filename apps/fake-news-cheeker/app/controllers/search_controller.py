from flask import request, jsonify
from ..services.scrape_service import ScrapeService
from ..core.error_handler import handle_error
import asyncio
import uuid

class SearchController:
    def __init__(self):
        self.service = ScrapeService()

    @handle_error
    def search_web(self):
        data = request.get_json(silent=True) or {}
        query = (data.get("query") or "").strip()

        if not query:
            return jsonify({
                "status": "error",
                "message": "Query is required"
            }), 400

        try:
            max_results = int(data.get("max_results", 5))
            max_results = max(1, min(max_results, 20))
        except Exception:
            max_results = 5

        try:
            articles = asyncio.run(self.service.search_news_async(query, max_results, scrape_content=False))
            if not isinstance(articles, list):
                raise TypeError("search_news did not return a list")
            analysis = {
                "verdict": "verified",
                "confidence": 0.95,
                "explanation": "No explanation provided",
                "category": "fake"
            }
            return jsonify({
                "status": "success",
                "query": query,
                "results_count": len(articles),
                "articles": [
                    {
                        "title": a.get("title", ""),
                        "url": a.get("url", ""),
                        "source": a.get("source", "unknown"),
                        "snippet": a.get("snippet", ""),
                        "date": a.get("date", ""),
                        "sources": a.get("sources", [])
                    }
                    for a in articles
                ]
            })
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "Search failed",
                "error": str(e)
            }), 500