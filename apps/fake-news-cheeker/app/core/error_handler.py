from functools import wraps
from flask import jsonify
import logging
from .exceptions import ScrapingError, AnalysisError

logger = logging.getLogger(__name__)

def handle_error(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ScrapingError as e:
            logger.error(f"Scraping error: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Scraping failed",
                "error": str(e)
            }), 500
        except AnalysisError as e:
            logger.error(f"Analysis error: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Analysis failed",
                "error": str(e)
            }), 500
        except Exception as e:
            logger.exception(f"Unexpected error in {func.__name__}: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Internal server error",
                "error": str(e)
            }), 500
    return wrapper
