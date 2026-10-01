import random
from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from utils.auth import token_required, admin_required

ticket_bp = Blueprint("tickets", __name__, url_prefix="/api/tickets")

@ticket_bp.route("", methods=["GET"])
@token_required
def get_user_tickets():
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, ticket_code, user_id, student_name, student_id, issue, category, priority, status, created_at
        FROM support_tickets
        WHERE user_id = ?
        ORDER BY id DESC
    """, (user_id,))
    tickets = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"tickets": tickets}), 200


@ticket_bp.route("", methods=["POST"])
@token_required
def create_ticket():
    user = request.current_user
    data = request.get_json() or {}
    issue = data.get("issue", "").strip()
    category = data.get("category", "General").strip()
    priority = data.get("priority", "Medium").strip()

    if not issue:
        return jsonify({"error": "Issue description is required"}), 400

    ticket_code = f"TICK-{random.randint(1000, 9999)}"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO support_tickets (ticket_code, user_id, student_name, student_id, issue, category, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Open')
    """, (ticket_code, user["id"], user["name"], user["student_id"], issue, category, priority))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Support ticket created successfully",
        "ticket": {
            "id": new_id,
            "ticket_code": ticket_code,
            "issue": issue,
            "category": category,
            "priority": priority,
            "status": "Open"
        }
    }), 201


@ticket_bp.route("/admin/all", methods=["GET"])
@admin_required
def get_all_tickets_admin():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, ticket_code, user_id, student_name, student_id, issue, category, priority, status, created_at
        FROM support_tickets
        ORDER BY id DESC
    """)
    tickets = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"tickets": tickets}), 200


@ticket_bp.route("/admin/<int:ticket_id>", methods=["PUT"])
@admin_required
def update_ticket_status(ticket_id):
    data = request.get_json() or {}
    new_status = data.get("status", "").strip()

    if new_status not in ["Open", "In Progress", "Resolved", "Closed"]:
        return jsonify({"error": "Invalid status value"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE support_tickets SET status = ? WHERE id = ?", (new_status, ticket_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Ticket not found"}), 404

    return jsonify({"message": "Ticket status updated successfully", "status": new_status}), 200
