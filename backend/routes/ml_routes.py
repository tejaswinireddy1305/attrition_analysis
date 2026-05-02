from flask import Blueprint, request, jsonify
from data_store import model

ml_bp = Blueprint('ml', __name__)

@ml_bp.route('/predict', methods=['POST'])
def predict_attrition():
    """Predict attrition risk for an employee"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Predict using the model
        prediction = model.predict_attrition(data)

        return jsonify({
            "success": True,
            "prediction": prediction
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ml_bp.route('/model-info', methods=['GET'])
def get_model_info():
    """Get information about the ML model"""
    try:
        return jsonify({
            "model_type": "Random Forest Classifier",
            "accuracy": 0.881,  # From training
            "features": model.feature_columns,
            "description": "Predicts employee attrition risk based on HR data"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500