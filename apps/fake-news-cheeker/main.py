from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from app.database import init_db
from app.routes import claim_bp, search_bp, analyze_bp
from app.routes.public_routes import public_bp

def create_app():
    # Load environment variables
    load_dotenv()
    # Initialize database
    init_db()
    # Create Flask app
    app = Flask(__name__)
    # Enable CORS
    CORS(app)

    # Register blueprints
    app.register_blueprint(claim_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(public_bp)

    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy"}), 200

    return app

if __name__ == '__main__':
    # Always run this with: python -m main
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
