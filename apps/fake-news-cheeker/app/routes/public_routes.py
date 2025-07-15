from flask import Blueprint, jsonify, request
from app.services.public_service import PublicService
import time

public_bp = Blueprint("public_bp", __name__)

def get_pagination_params():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        return max(page, 1), min(limit, 100)  # basic bounds check
    except ValueError:
        return 1, 10

@public_bp.route("/public/claims", methods=["GET"])
def get_all_claims():
    page, limit = get_pagination_params()
    search = request.args.get("search", "").strip() or None
    category = request.args.get("category", "all")
    verdict = request.args.get("verdict", "all")
    
    return jsonify(PublicService.get_all_claims(page, limit, search, category, verdict))

@public_bp.route("/public/claims/high-confidence", methods=["GET"])
def high_confidence_claims():
    page, limit = get_pagination_params()
    return jsonify(PublicService.get_high_confidence_claims(page, limit))

@public_bp.route("/public/claims/by-category/<string:category>", methods=["GET"])
def get_claims_by_category(category):
    page, limit = get_pagination_params()
    return jsonify(PublicService.get_claims_by_category(category, page, limit))

@public_bp.route("/public/sources", methods=["GET"])
def get_all_sources():
    page, limit = get_pagination_params()
    search = request.args.get("search", "").strip() or None
    domain = request.args.get("domain", "all")
    
    return jsonify(PublicService.get_all_sources(page, limit, search, domain))

@public_bp.route("/public/sources/by-domain/<string:domain>", methods=["GET"])
def get_sources_by_domain(domain):
    page, limit = get_pagination_params()
    return jsonify(PublicService.get_sources_by_domain(domain, page, limit))

@public_bp.route("/public/analyses", methods=["GET"])
def get_all_analyses():
    page, limit = get_pagination_params()
    search = request.args.get("search", "").strip() or None
    support = request.args.get("support", "all")
    
    return jsonify(PublicService.get_all_analyses(page, limit, search, support))

@public_bp.route("/public/analyses/supported", methods=["GET"])
def get_supported_analyses():
    page, limit = get_pagination_params()
    return jsonify(PublicService.get_supported_analyses(page, limit))

@public_bp.route("/public/analyses/latest", methods=["GET"])
def get_latest_analyses():
    page, limit = get_pagination_params()
    return jsonify(PublicService.get_latest_analyses(page, limit))

@public_bp.route("/public/stats", methods=["GET"])
def get_system_stats():
    """Get comprehensive system statistics for admin dashboard"""
    return jsonify(PublicService.get_system_stats())

# Export endpoints for CSV
@public_bp.route("/public/export/claims", methods=["GET"])
def export_claims_csv():
    """Export claims data as CSV with filters"""
    search = request.args.get("search", "").strip() or None
    category = request.args.get("category", "all")
    verdict = request.args.get("verdict", "all")
    
    data = PublicService.export_claims_csv(search, category, verdict)
    return jsonify({
        "data": data,
        "filters": {
            "search": search,
            "category": category,
            "verdict": verdict
        }
    })

@public_bp.route("/public/export/sources", methods=["GET"])
def export_sources_csv():
    """Export sources data as CSV with filters"""
    search = request.args.get("search", "").strip() or None
    domain = request.args.get("domain", "all")
    
    data = PublicService.export_sources_csv(search, domain)
    return jsonify({
        "data": data,
        "filters": {
            "search": search,
            "domain": domain
        }
    })

@public_bp.route("/public/export/analyses", methods=["GET"])
def export_analyses_csv():
    """Export analyses data as CSV with filters"""
    search = request.args.get("search", "").strip() or None
    support = request.args.get("support", "all")
    
    data = PublicService.export_analyses_csv(search, support)
    return jsonify({
        "data": data,
        "filters": {
            "search": search,
            "support": support
        }
    })

@public_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for the extension"""
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "service": "VeriNews Backend",
        "version": "1.0.0"
    })
