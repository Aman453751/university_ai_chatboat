from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from utils.auth import token_required
from services.vapid_service import get_or_generate_vapid_keys, send_system_notification

notification_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notification_bp.route("/vapid-key", methods=["GET"])
def get_vapid_public_key():
    pub_key, _, _ = get_or_generate_vapid_keys()
    return jsonify({"public_key": pub_key}), 200


@notification_bp.route("/subscribe", methods=["POST"])
@token_required
def subscribe_push():
    user = request.current_user
    data = request.get_json() or {}

    endpoint = data.get("endpoint", "").strip()
    keys = data.get("keys") or {}
    p256dh = keys.get("p256dh", "").strip()
    auth = keys.get("auth", "").strip()
    user_agent = request.headers.get("User-Agent", "")

    if not endpoint or not p256dh or not auth:
        return jsonify({"error": "Invalid subscription object. Endpoint, p256dh, and auth are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(endpoint) DO UPDATE SET
            user_id = excluded.user_id,
            p256dh = excluded.p256dh,
            auth = excluded.auth,
            user_agent = excluded.user_agent
    """, (user["id"], endpoint, p256dh, auth, user_agent))

    conn.commit()
    conn.close()

    return jsonify({"message": "Push subscription registered successfully"}), 200


@notification_bp.route("/unsubscribe", methods=["POST"])
@token_required
def unsubscribe_push():
    user = request.current_user
    data = request.get_json() or {}
    endpoint = data.get("endpoint", "").strip()

    if not endpoint:
        return jsonify({"error": "Endpoint is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?", (endpoint, user["id"]))
    conn.commit()
    conn.close()

    return jsonify({"message": "Push subscription removed successfully"}), 200


@notification_bp.route("", methods=["GET"])
@token_required
def get_in_app_notifications():
    user = request.current_user
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, message, category, link, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 20
    """, (user["id"],))
    notifications = [dict(r) for r in cursor.fetchall()]
    conn.close()

    unread_count = sum(1 for n in notifications if n["is_read"] == 0)

    return jsonify({
        "notifications": notifications,
        "unread_count": unread_count
    }), 200


@notification_bp.route("/read", methods=["PUT"])
@token_required
def mark_read():
    user = request.current_user
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user["id"],))
    conn.commit()
    conn.close()

    return jsonify({"message": "Notifications marked as read"}), 200


@notification_bp.route("/clear", methods=["DELETE"])
@token_required
def clear_notifications():
    user = request.current_user
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user["id"],))
    conn.commit()
    conn.close()

    return jsonify({"message": "Notifications cleared"}), 200


@notification_bp.route("/test-event", methods=["POST"])
@token_required
def trigger_test_event():
    user = request.current_user
    data = request.get_json() or {}
    event_type = data.get("event_type", "deadline")

    events = {
        "login": {
            "title": "🔐 New Login Detected",
            "message": "A new login to your university student account was detected.",
            "category": "Security"
        },
        "profile": {
            "title": "👤 Profile Updated",
            "message": "Your student profile information has been updated.",
            "category": "Account"
        },
        "deadline": {
            "title": "⏰ Deadline Reminder",
            "message": "Your exam registration deadline is tomorrow.",
            "category": "Academics"
        },
        "ticket": {
            "title": "🎫 Support Ticket Updated",
            "message": "Your support ticket #1024 has been updated.",
            "category": "Support"
        },
        "notice": {
            "title": "📢 New University Notice",
            "message": "A new important university notice has been published.",
            "category": "Announcement"
        }
    }

    event_info = events.get(event_type, events["deadline"])

    send_system_notification(
        user["id"],
        title=event_info["title"],
        message=event_info["message"],
        link="/dashboard",
        category=event_info["category"]
    )

    return jsonify({
        "message": f"Triggered test event: {event_info['title']}",
        "event": event_info
    }), 200
