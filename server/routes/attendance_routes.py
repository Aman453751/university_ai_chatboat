from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from utils.auth import token_required
from services.vapid_service import send_system_notification

attendance_bp = Blueprint("attendance", __name__, url_prefix="/api/attendance")

@attendance_bp.route("", methods=["GET"])
@token_required
def get_student_attendance():
    """
    Returns the authenticated student's overall attendance % and subject-wise records.
    The student ID is derived strictly from the JWT token authentication header.
    """
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, subject, subject_code, total_classes, attended_classes, absent_classes, attendance_percentage, updated_at
        FROM attendance
        WHERE student_id = ?
        ORDER BY id ASC
    """, (user_id,))
    
    rows = cursor.fetchall()
    subjects = [dict(r) for r in rows]

    total_attended = sum(s["attended_classes"] for s in subjects)
    total_classes_all = sum(s["total_classes"] for s in subjects)
    total_absent = sum(s["absent_classes"] for s in subjects)

    if total_classes_all > 0:
        overall_percentage = round((total_attended / total_classes_all) * 100.0, 1)
    else:
        overall_percentage = request.current_user.get("attendance_pct", 100.0)

    # Sync overall_pct back to user profile if needed
    cursor.execute("UPDATE users SET attendance_pct = ? WHERE id = ?", (overall_percentage, user_id))
    conn.commit()
    conn.close()

    # Identify warning status
    low_subjects = [s for s in subjects if s["attendance_percentage"] < 75.0]

    return jsonify({
        "student_name": request.current_user["name"],
        "student_id": request.current_user["student_id"],
        "course": request.current_user.get("course", ""),
        "overall_percentage": overall_percentage,
        "total_attended": total_attended,
        "total_classes": total_classes_all,
        "total_absent": total_absent,
        "has_warning": len(low_subjects) > 0,
        "warning_subjects_count": len(low_subjects),
        "subjects": subjects
    }), 200


@attendance_bp.route("", methods=["PUT"])
@token_required
def update_attendance_records():
    user_id = request.current_user["id"]
    data = request.get_json() or {}
    subject_code = data.get("subject_code", "").strip()
    attended = data.get("attended_classes")
    total = data.get("total_classes")

    conn = get_db_connection()
    cursor = conn.cursor()

    if subject_code and attended is not None and total is not None:
        pct = round((attended / total) * 100.0, 1) if total > 0 else 0.0
        absent = max(0, total - attended)
        cursor.execute("""
            UPDATE attendance
            SET attended_classes = ?, total_classes = ?, absent_classes = ?, attendance_percentage = ?, updated_at = CURRENT_TIMESTAMP
            WHERE student_id = ? AND subject_code = ?
        """, (attended, total, absent, pct, user_id, subject_code))
        conn.commit()

    conn.close()

    try:
        send_system_notification(
            user_id,
            "ABES Student Portal",
            "Your attendance has been updated.",
            link="/dashboard",
            category="Attendance"
        )
    except Exception as e:
        print(f"Failed to send attendance update notification: {e}")

    return jsonify({"message": "Attendance records updated successfully"}), 200


@attendance_bp.route("/summary", methods=["GET"])
@token_required
def get_attendance_summary():
    """Returns concise attendance summary for the authenticated student."""
    return get_student_attendance()


@attendance_bp.route("/subjects", methods=["GET"])
@token_required
def get_attendance_subjects():
    """Returns detailed subject array for the authenticated student."""
    return get_student_attendance()
