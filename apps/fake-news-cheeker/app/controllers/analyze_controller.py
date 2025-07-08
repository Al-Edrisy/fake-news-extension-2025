from flask import request, jsonify
from ..services.analyze_service import AnalyzeService
from ..core.error_handler import handle_error

class AnalyzeController:
    def __init__(self):
        self.service = AnalyzeService()

    @handle_error
    def analyze_content(self):
        if not request.is_json:
            return jsonify({
                "status": "error",
                "message": "Request must be JSON",
                "code": 400
            }), 400

        data = request.get_json()
        claim = data.get('claim')
        articles = data.get('articles', [])

        if not claim or not articles:
            return jsonify({
                "status": "error",
                "message": "Both claim and articles are required",
                "code": 400
            }), 400

        # Use parallel analysis
        raw_results = self.service.analyze_sources(claim, articles)
        analysis = self.service.compute_final_verdict(claim, raw_results)

        return jsonify({
            "status": "success",
            "verdict": analysis["verdict"],
            "confidence": analysis["confidence"],
            "explanation": analysis["explanation"],
            "conclusion": analysis.get("conclusion"),
            "category": analysis["category"],
            "sources": analysis["sources"]
        })
