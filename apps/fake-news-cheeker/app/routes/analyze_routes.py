from flask import Blueprint, request, jsonify
from ..controllers.analyze_controller import AnalyzeController
from ..core.error_handler import handle_error
import time

analyze_bp = Blueprint('analyze', __name__, url_prefix='/api/analysis')
controller = AnalyzeController()

@analyze_bp.route('/analyze', methods=['POST'])
@handle_error
def analyze_claim():
    start_time = time.perf_counter()
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    claim_text = data.get('claim', '').strip()

    if not claim_text:
        return jsonify({"error": "Missing claim in request body"}), 400

    # Delegate to controller method
    result = controller.analyze_content()
    # Add processing time info
    if isinstance(result, tuple):
        response, status = result
        if isinstance(response, dict):
            response['processing_time'] = f"{(time.perf_counter() - start_time):.3f}s"
        return response, status
    elif hasattr(result, 'json'):
        # Flask Response
        return result
    elif isinstance(result, dict):
        result['processing_time'] = f"{(time.perf_counter() - start_time):.3f}s"
        return jsonify(result), 200

    return jsonify({"error": "Internal server error"}), 500
