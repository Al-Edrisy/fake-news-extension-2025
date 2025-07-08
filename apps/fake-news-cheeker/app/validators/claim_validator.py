def validate_claim_payload(payload: dict) -> list:
    """Validate claim submission payload"""
    errors = []

    if "claim" not in payload:
        errors.append("Missing required field: claim")
    elif not isinstance(payload["claim"], str):
        errors.append("Claim must be a string")
    elif len(payload["claim"].strip()) < 10:
        errors.append("Claim must be at least 10 characters")

    return errors
