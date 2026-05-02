from flask import Blueprint, jsonify, request

from auth import create_token
from data_store import USERS

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    role = (body.get("role") or "").strip().lower()

    user = next(
        (u for u in USERS if u["username"] == username and u["password"] == password and u["role"] == role),
        None,
    )
    if not user:
        return jsonify({"error": "Invalid credentials for selected role"}), 401

    token = create_token(user)
    return jsonify(
        {
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "username": user["username"],
                "role": user["role"],
                "team": user["team"],
            },
        }
    )
