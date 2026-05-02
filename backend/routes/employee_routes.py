from flask import Blueprint, g, jsonify, request

from auth import roles_required, token_required
from data_store import EMPLOYEES, USERS

employee_bp = Blueprint("employees", __name__, url_prefix="/api/employees")


@employee_bp.get("")
@token_required
@roles_required("admin", "hr")
def list_employees():
    search = (request.args.get("search") or "").strip().lower()

    scoped_rows = EMPLOYEES
    if g.user["role"] == "hr":
        scoped_rows = [row for row in EMPLOYEES if row.get("team") == g.user.get("team")]

    if search:
        scoped_rows = [
            row
            for row in scoped_rows
            if search in str(row.get("id", "")).lower()
            or search in str(row.get("name", "")).lower()
        ]

    return jsonify(scoped_rows)


@employee_bp.get("/hrs")
@token_required
@roles_required("admin")
def list_hr_users():
    search = (request.args.get("search") or "").strip().lower()

    hr_users = [
        {
            "id": user["id"],
            "username": user["username"],
            "name": user["name"],
            "team": user["team"],
            "role": user["role"],
        }
        for user in USERS
        if user.get("role") == "hr"
    ]

    if search:
        hr_users = [
            user
            for user in hr_users
            if search in str(user.get("id", "")).lower()
            or search in str(user.get("username", "")).lower()
            or search in str(user.get("name", "")).lower()
            or search in str(user.get("team", "")).lower()
        ]

    return jsonify(hr_users)


@employee_bp.post("")
@token_required
@roles_required("admin", "hr")
def add_employee():
    body = request.get_json(silent=True) or {}
    required = ["id", "name", "department", "job_role", "risk", "risk_score"]
    if any(not body.get(k) and body.get(k) != 0 for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    if any(e["id"] == body["id"] for e in EMPLOYEES):
        return jsonify({"error": "Employee ID already exists"}), 409

    team = g.user["team"] if g.user["role"] == "hr" else body.get("team", "General")
    row = {
        "id": body["id"],
        "name": body["name"],
        "department": body["department"],
        "job_role": body["job_role"],
        "risk": body["risk"],
        "risk_score": body["risk_score"],
        "team": team,
    }
    EMPLOYEES.append(row)
    return jsonify(row), 201


@employee_bp.put("/<employee_id>")
@token_required
@roles_required("admin", "hr")
def update_employee(employee_id):
    target = next((e for e in EMPLOYEES if e["id"] == employee_id), None)
    if not target:
        return jsonify({"error": "Employee not found"}), 404
    if g.user["role"] == "hr" and target["team"] != g.user["team"]:
        return jsonify({"error": "Cannot modify employee outside your team"}), 403

    body = request.get_json(silent=True) or {}
    for field in ["name", "department", "job_role", "risk", "risk_score"]:
        if field in body:
            target[field] = body[field]
    return jsonify(target)


@employee_bp.delete("/<employee_id>")
@token_required
@roles_required("admin", "hr")
def delete_employee(employee_id):
    idx = next((i for i, e in enumerate(EMPLOYEES) if e["id"] == employee_id), None)
    if idx is None:
        return jsonify({"error": "Employee not found"}), 404
    if g.user["role"] == "hr" and EMPLOYEES[idx]["team"] != g.user["team"]:
        return jsonify({"error": "Cannot delete employee outside your team"}), 403

    deleted = EMPLOYEES.pop(idx)
    return jsonify({"deleted": deleted["id"]})
