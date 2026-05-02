from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, g, jsonify, request


def create_token(user):
    expiry = datetime.now(tz=timezone.utc) + timedelta(minutes=current_app.config["TOKEN_EXP_MINUTES"])
    payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "role": user["role"],
        "name": user["name"],
        "team": user["team"],
        "exp": expiry,
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def decode_token(token):
    return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])


def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = header.replace("Bearer ", "", 1).strip()
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        g.user = payload
        return fn(*args, **kwargs)

    return wrapper


def roles_required(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            role = g.user.get("role")
            if role not in allowed_roles:
                return jsonify({"error": "Forbidden: insufficient role"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
