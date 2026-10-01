import uuid
import json
from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from utils.auth import token_required
from services.ai_service import generate_ai_response

from services.intent_service import detect_intent, detect_sentiment

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")

@chat_bp.route("", methods=["POST"])
@token_required
def chat():
    data = request.get_json() or {}
    user_id = request.current_user["id"]
    message_text = str(data.get("message") or "").strip()
    raw_conv_id = data.get("conversation_id")
    conversation_id = str(raw_conv_id).strip() if raw_conv_id else ""
    mode = data.get("mode", "university")
    language = data.get("language", "English")

    if not message_text:
        return jsonify({"error": "Message cannot be empty"}), 400

    intent_code, intent_label = detect_intent(message_text)
    sentiment_code, sentiment_label = detect_sentiment(message_text)

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if existing conversation matches user
    conversation = None
    if conversation_id:
        cursor.execute("SELECT * FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
        conversation = cursor.fetchone()

    # Create new conversation if not existing
    if not conversation:
        conversation_id = str(uuid.uuid4())
        title = message_text[:35] + ("..." if len(message_text) > 35 else "")
        cursor.execute("INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)", (conversation_id, user_id, title))
        conn.commit()
    else:
        title = conversation["title"]

    # Save user message to database with intent and sentiment
    cursor.execute("INSERT INTO messages (conversation_id, sender, content, intent, sentiment) VALUES (?, 'user', ?, ?, ?)",
                   (conversation_id, message_text, intent_label, sentiment_label))
    conn.commit()

    # Retrieve recent chat history for context
    cursor.execute("SELECT sender, content FROM messages WHERE conversation_id = ? ORDER BY id ASC", (conversation_id,))
    history_rows = cursor.fetchall()
    chat_history = [{"sender": row["sender"], "content": row["content"]} for row in history_rows]

    # Retrieve authenticated student's complete profile and attendance records
    cursor.execute("SELECT id, student_id, name, email, course, branch, semester, section, attendance_pct FROM users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    student_info = dict(user_row) if user_row else {}

    cursor.execute("""
        SELECT subject, subject_code, total_classes, attended_classes, absent_classes, attendance_percentage
        FROM attendance
        WHERE student_id = ?
        ORDER BY id ASC
    """, (user_id,))
    subject_rows = cursor.fetchall()
    subjects_list = [dict(r) for r in subject_rows]

    total_att = sum(s["attended_classes"] for s in subjects_list)
    total_cls = sum(s["total_classes"] for s in subjects_list)
    total_abs = sum(s["absent_classes"] for s in subjects_list)
    overall_pct = round((total_att / total_cls) * 100.0, 1) if total_cls > 0 else student_info.get("attendance_pct", 100.0)

    student_context = {
        "name": student_info.get("name", "Student"),
        "student_id": student_info.get("student_id", ""),
        "course": student_info.get("course", ""),
        "branch": student_info.get("branch", ""),
        "semester": student_info.get("semester", ""),
        "section": student_info.get("section", ""),
        "overall_percentage": overall_pct,
        "total_attended": total_att,
        "total_classes": total_cls,
        "total_absent": total_abs,
        "subjects": subjects_list
    }

    # Generate AI response
    try:
        ai_res = generate_ai_response(
            message_text,
            chat_history=chat_history,
            student_context=student_context,
            mode=mode,
            language=language,
            intent=intent_code,
            sentiment=sentiment_code
        )
        ai_content = ai_res.get("content", "")
        sources_list = ai_res.get("sources", [])
        sources_str = json.dumps(sources_list) if sources_list else None
    except Exception as e:
        print(f"Error in generate_ai_response: {e}")
        ai_content = "Sorry, I'm having trouble connecting right now. Please try again in a moment or contact student support at support@abcuniversity.edu."
        sources_str = None

    # Save assistant message to database
    cursor.execute("INSERT INTO messages (conversation_id, sender, content, sources, intent, sentiment) VALUES (?, ?, ?, ?, ?, ?)",
                   (conversation_id, 'assistant', ai_content, sources_str, intent_label, sentiment_label))
    cursor.execute("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (conversation_id,))
    conn.commit()

    assistant_msg_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "reply": ai_content,
        "response": ai_content,
        "conversation_id": conversation_id,
        "title": title,
        "intent": intent_label,
        "sentiment": sentiment_label,
        "mode": mode,
        "language": language,
        "message": {
            "id": assistant_msg_id,
            "sender": "assistant",
            "content": ai_content,
            "sources": sources_list,
            "intent": intent_label,
            "sentiment": sentiment_label
        }
    }), 200


@chat_bp.route("/conversations", methods=["GET"])
@token_required
def get_conversations():
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, created_at, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()

    conversations = [dict(row) for row in rows]
    return jsonify({"conversations": conversations}), 200


@chat_bp.route("/conversations/<conv_id>", methods=["GET"])
@token_required
def get_conversation_messages(conv_id):
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM conversations WHERE id = ? AND user_id = ?", (conv_id, user_id))
    conversation = cursor.fetchone()

    if not conversation:
        conn.close()
        return jsonify({"error": "Conversation not found"}), 404

    cursor.execute("SELECT id, conversation_id, sender, content, sources, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC", (conv_id,))
    message_rows = cursor.fetchall()
    conn.close()

    messages = []
    for row in message_rows:
        msg = dict(row)
        if msg["sources"]:
            try:
                msg["sources"] = json.loads(msg["sources"])
            except:
                msg["sources"] = []
        else:
            msg["sources"] = []
        messages.append(msg)

    return jsonify({
        "conversation": dict(conversation),
        "messages": messages
    }), 200


@chat_bp.route("/conversations/<conv_id>", methods=["PUT"])
@token_required
def rename_conversation(conv_id):
    user_id = request.current_user["id"]
    data = request.get_json() or {}
    new_title = data.get("title", "").strip()

    if not new_title:
        return jsonify({"error": "Title cannot be empty"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?", (new_title, conv_id, user_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Conversation not found or unauthorized"}), 404

    return jsonify({"message": "Conversation renamed successfully", "title": new_title}), 200


@chat_bp.route("/conversations/<conv_id>", methods=["DELETE"])
@token_required
def delete_conversation(conv_id):
    user_id = request.current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM conversations WHERE id = ? AND user_id = ?", (conv_id, user_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Conversation not found or unauthorized"}), 404

    return jsonify({"message": "Conversation deleted successfully"}), 200