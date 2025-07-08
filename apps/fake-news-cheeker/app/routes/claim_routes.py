from flask import Blueprint
from ..controllers.claim_controller import ClaimController

claim_bp = Blueprint('claims', __name__, url_prefix='/api/claims')
controller = ClaimController()

@claim_bp.route('/verify', methods=['POST'])
def verify_claim():
    """Route for claim verification"""
    return controller.verify_claim()
