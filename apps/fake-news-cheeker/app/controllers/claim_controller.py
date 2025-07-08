from flask import request, jsonify
from ..services.claim_service import ClaimService
from ..core.error_handler import handle_error

class ClaimController:
    def __init__(self):
        self.service = ClaimService()

    @handle_error
    def verify_claim(self):
        if not request.is_json:
            return jsonify({
                "status": "error",
                "message": "Request must be JSON",
                "code": 400
            }), 400

        data = request.get_json()
        claim_text = data.get('claim')

        if not claim_text or not isinstance(claim_text, str):
            return jsonify({
                "status": "error",
                "message": "Valid claim text is required",
                "code": 400
            }), 400

        result = self.service.verify_claim(claim_text)
        return jsonify(result), 200 if result.get("status") == "success" else 400