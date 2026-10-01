from datetime import datetime, date
from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from utils.auth import token_required
from services.vapid_service import send_system_notification
import werkzeug.security as security

student_bp = Blueprint("student", __name__, url_prefix="/api/student")

@student_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    user_id = request.current_user["id"]
    data = request.get_json() or {}
    name = data.get("name", request.current_user["name"]).strip()
    phone = data.get("phone", request.current_user.get("phone", "")).strip()
    section = data.get("section", request.current_user.get("section", "")).strip()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = ?, phone = ?, section = ? WHERE id = ?", (name, phone, section, user_id))
    conn.commit()
    conn.close()

    try:
        send_system_notification(
            user_id,
            "ABES Student Portal",
            "Your profile information has been updated.",
            link="/settings",
            category="Profile"
        )
    except Exception as e:
        print(f"Failed to send profile update notification: {e}")

    return jsonify({"message": "Profile information updated successfully"}), 200


@student_bp.route("/password", methods=["PUT"])
@token_required
def change_password():
    user_id = request.current_user["id"]
    data = request.get_json() or {}
    old_pass = data.get("old_password", "")
    new_pass = data.get("new_password", "")

    if not new_pass or len(new_pass) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()

    if old_pass and not security.check_password_hash(row["password_hash"], old_pass):
        conn.close()
        return jsonify({"error": "Current password is incorrect"}), 400

    new_hash = security.generate_password_hash(new_pass)
    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()

    try:
        send_system_notification(
            user_id,
            "ABES Student Portal",
            "Your password has been changed successfully.",
            link="/settings",
            category="Security"
        )
    except Exception as e:
        print(f"Failed to send password change notification: {e}")

    return jsonify({"message": "Password updated successfully"}), 200


@student_bp.route("/profile", methods=["GET"])
@token_required
def get_student_profile():
    user = request.current_user
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get upcoming exams matching user course / semester or general
    cursor.execute("SELECT id, course, semester, subject, exam_date, exam_time, venue FROM exams WHERE course = ? OR course LIKE '%Computer Science%' ORDER BY exam_date ASC LIMIT 5", (user["course"],))
    exams = [dict(r) for r in cursor.fetchall()]

    # Get recent notices
    cursor.execute("SELECT id, title, content, category, date FROM notices ORDER BY id DESC LIMIT 5")
    notices = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return jsonify({
        "student": user,
        "upcoming_exams": exams,
        "recent_notices": notices,
        "upcoming_events": [
            {"id": 1, "title": "TechnoBYTE 2026 Tech Fest", "date": "2026-10-14", "venue": "Main Auditorium"},
            {"id": 2, "title": "Annual Career & Placement Fair", "date": "2026-11-05", "venue": "Sports Complex"},
            {"id": 3, "title": "Winter Hackathon 'Hack-ABC'", "date": "2026-11-20", "venue": "CSE Computing Lab"}
        ]
    }), 200


# ---------------------------------------------------------------------------
# DEADLINES API
# ---------------------------------------------------------------------------
@student_bp.route("/deadlines", methods=["GET"])
@token_required
def get_deadlines():
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student_deadlines WHERE user_id = ? ORDER BY deadline ASC", (user_id,))
    rows = cursor.fetchall()
    conn.close()

    today = date.today()
    deadlines = []
    for r in rows:
        d = dict(r)
        try:
            dl_date = datetime.strptime(d["deadline"], "%Y-%m-%d").date()
            diff = (dl_date - today).days
            if diff < 0:
                computed_status = "Overdue"
            elif diff == 0:
                computed_status = "Due Today"
            elif diff == 1:
                computed_status = "Due Tomorrow"
            else:
                computed_status = f"Due in {diff} days"
        except Exception:
            computed_status = d.get("status", "Upcoming")

        d["computed_status"] = computed_status
        deadlines.append(d)

    return jsonify({"deadlines": deadlines}), 200


@student_bp.route("/deadlines", methods=["POST"])
@token_required
def add_deadline():
    user_id = request.current_user["id"]
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "General").strip()
    deadline = data.get("deadline", "").strip()
    priority = data.get("priority", "Medium").strip()

    if not title or not deadline:
        return jsonify({"error": "Title and Deadline date are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO student_deadlines (user_id, title, description, category, deadline, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Upcoming')
    """, (user_id, title, description, category, deadline, priority))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({"message": "Deadline added successfully", "id": new_id}), 201


@student_bp.route("/deadlines/<int:deadline_id>", methods=["DELETE"])
@token_required
def delete_deadline(deadline_id):
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM student_deadlines WHERE id = ? AND user_id = ?", (deadline_id, user_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Deadline not found or unauthorized"}), 404

    return jsonify({"message": "Deadline deleted successfully"}), 200


# ---------------------------------------------------------------------------
# SAVED ANSWERS API
# ---------------------------------------------------------------------------
@student_bp.route("/saved", methods=["GET"])
@token_required
def get_saved_answers():
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content, category, created_at FROM saved_answers WHERE user_id = ? ORDER BY id DESC", (user_id,))
    saved = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({"saved_answers": saved}), 200


@student_bp.route("/saved", methods=["POST"])
@token_required
def save_answer():
    user_id = request.current_user["id"]
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    category = data.get("category", "General").strip()

    if not title or not content:
        return jsonify({"error": "Title and Content are required to save"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO saved_answers (user_id, title, content, category)
        VALUES (?, ?, ?, ?)
    """, (user_id, title, content, category))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({"message": "Answer saved successfully", "id": new_id}), 201


@student_bp.route("/saved/<int:saved_id>", methods=["DELETE"])
@token_required
def delete_saved_answer(saved_id):
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM saved_answers WHERE id = ? AND user_id = ?", (saved_id, user_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Saved answer not found or unauthorized"}), 404

    return jsonify({"message": "Saved answer removed"}), 200


# ---------------------------------------------------------------------------
# DYNAMIC AI STUDENT INSIGHTS API
# ---------------------------------------------------------------------------
@student_bp.route("/insights", methods=["GET"])
@token_required
def get_student_insights():
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    # Deadlines count
    cursor.execute("SELECT COUNT(*) FROM student_deadlines WHERE user_id = ?", (user_id,))
    deadlines_count = cursor.fetchone()[0]

    # Attendance
    cursor.execute("SELECT attendance_pct FROM users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    attendance_pct = user_row[0] if user_row else 85.0

    cursor.execute("SELECT COUNT(*) FROM attendance WHERE student_id = ? AND attendance_percentage < 75.0", (user_id,))
    low_att_count = cursor.fetchone()[0]

    # Open tickets
    cursor.execute("SELECT COUNT(*) FROM support_tickets WHERE user_id = ? AND status != 'Resolved' AND status != 'Closed'", (user_id,))
    open_tickets = cursor.fetchone()[0]

    # Recent notices count
    cursor.execute("SELECT COUNT(*) FROM notices")
    notices_count = cursor.fetchone()[0]

    conn.close()

    insights = []

    if deadlines_count > 0:
        insights.append({
            "icon": "📚",
            "title": f"Upcoming Deadlines ({deadlines_count})",
            "description": f"You have {deadlines_count} active task(s) and deadline(s) scheduled on your student portal.",
            "type": "info"
        })

    if low_att_count > 0:
        insights.append({
            "icon": "⚠️",
            "title": f"Attendance Alert ({low_att_count} Subject Warning)",
            "description": f"You have {low_att_count} subject(s) below the mandatory 75% attendance threshold.",
            "type": "warning"
        })
    else:
        insights.append({
            "icon": "📊",
            "title": f"Strong Attendance Performance ({attendance_pct}%)",
            "description": f"Great job! Your overall attendance is {attendance_pct}%, safely above the 75% requirement.",
            "type": "success"
        })

    if open_tickets > 0:
        insights.append({
            "icon": "🎫",
            "title": f"Active Support Tickets ({open_tickets})",
            "description": f"You have {open_tickets} open support request(s) currently being processed by administration.",
            "type": "info"
        })

    insights.append({
        "icon": "📢",
        "title": f"Latest Campus Notices ({notices_count})",
        "description": f"There are {notices_count} verified official campus announcements available.",
        "type": "neutral"
    })

    return jsonify({
        "insights": insights,
        "summary": {
            "deadlines_count": deadlines_count,
            "attendance_pct": attendance_pct,
            "low_attendance_subjects": low_att_count,
            "open_tickets": open_tickets,
            "notices_count": notices_count
        }
    }), 200
