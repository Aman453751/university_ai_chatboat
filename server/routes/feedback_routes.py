from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from utils.auth import decode_token

feedback_bp = Blueprint("feedback", __name__, url_prefix="/api/feedback")

@feedback_bp.route("", methods=["POST"])
def submit_feedback():
    data = request.get_json() or {}
    message_id = data.get("message_id")
    conversation_id = data.get("conversation_id")
    rating = data.get("rating", "").strip().lower() # 'like' or 'dislike'
    comment = data.get("comment", "").strip()

    if rating not in ["like", "dislike"]:
        return jsonify({"error": "Rating must be 'like' or 'dislike'"}), 400

    # Extract user ID if token provided
    user_id = None
    if "Authorization" in request.headers:
        token = request.headers["Authorization"].replace("Bearer ", "")
        payload = decode_token(token)
        if payload:
            user_id = payload.get("user_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO feedback (message_id, conversation_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
    ''', (message_id, conversation_id, user_id, rating, comment))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({"message": "Feedback submitted successfully", "id": new_id}), 201
