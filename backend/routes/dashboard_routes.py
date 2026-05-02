from flask import Blueprint, g, jsonify

from auth import roles_required, token_required
from data_store import DASHBOARD_KPI, EMPLOYEE_PERFORMANCE, EMPLOYEES

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api")


@dashboard_bp.get("/me")
@token_required
def me():
    return jsonify(
        {
            "id": g.user["sub"],
            "name": g.user["name"],
            "username": g.user["username"],
            "role": g.user["role"],
            "team": g.user["team"],
        }
    )


@dashboard_bp.get("/dashboard/analytics")
@token_required
@roles_required("admin", "hr")
def analytics_dashboard():
    # Show complete analytics data for both admin and HR dashboards.
    scoped_rows = EMPLOYEES

    return jsonify(
        {
            "kpi": DASHBOARD_KPI,
            "high_risk_table": scoped_rows,
            "charts": {
                "attrition_by_department": True,
                "attrition_by_role": True,
                "salary_vs_attrition": True,
                "experience_vs_attrition": True,
            },
        }
    )


@dashboard_bp.get("/dashboard/employee")
@token_required
@roles_required("employee")
def employee_dashboard():
    try:
        user_id = int(g.user["sub"])
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid user id in token"}), 401

    data = EMPLOYEE_PERFORMANCE.get(user_id)
    if not data:
        return jsonify({"error": "Performance data not found"}), 404

    return jsonify(
        {
            "profile": data,
            "restrictions": {
                "show_company_charts": False,
                "show_employee_management": False,
                "show_upload": False,
                "show_reports": False,
            },
        }
    )
