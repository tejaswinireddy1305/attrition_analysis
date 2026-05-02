from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes.auth_routes import auth_bp
from routes.dashboard_routes import dashboard_bp
from routes.employee_routes import employee_bp
from routes.ml_routes import ml_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(employee_bp)
    app.register_blueprint(ml_bp)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "attrition-backend"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=False, host="0.0.0.0", port=5000)
