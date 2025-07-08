from flask import Blueprint, jsonify, request
from app.services.public_service import PublicService

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
    return jsonify(PublicService.get_all_claims(page, limit))

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
    return jsonify(PublicService.get_all_sources(page, limit))

@public_bp.route("/public/sources/by-domain/<string:domain>", methods=["GET"])
def get_sources_by_domain(domain):
    page, limit = get_pagination_params()
    return jsonify(PublicService.get_sources_by_domain(domain, page, limit))

@public_bp.route("/public/analyses", methods=["GET"])
def get_all_analyses():
    page, limit = get_pagination_params()
    return jsonify(PublicService.get_all_analyses(page, limit))

@public_bp.route("/public/analyses/supported", methods=["GET"])
def get_supported_analyses():
    page, limit = get_pagination_params()
    return jsonify(PublicService.get_supported_analyses(page, limit))

@public_bp.route("/public/analyses/latest", methods=["GET"])
def get_latest_analyses():
    page, limit = get_pagination_params()
    return jsonify(PublicService.get_latest_analyses(page, limit))
