from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from utils.auth import admin_required

faq_kb_bp = Blueprint("faq_kb", __name__, url_prefix="/api")

# FAQs Endpoints
@faq_kb_bp.route("/faqs", methods=["GET"])
def get_faqs():
    category = request.args.get("category")
    conn = get_db_connection()
    cursor = conn.cursor()

    if category:
        cursor.execute("SELECT * FROM faqs WHERE category = ? ORDER BY is_popular DESC, id ASC", (category,))
    else:
        cursor.execute("SELECT * FROM faqs ORDER BY is_popular DESC, id ASC")

    rows = cursor.fetchall()
    conn.close()
    return jsonify({"faqs": [dict(r) for r in rows]}), 200


@faq_kb_bp.route("/faqs", methods=["POST"])
@admin_required
def create_faq():
    data = request.get_json() or {}
    category = data.get("category", "General").strip()
    question = data.get("question", "").strip()
    answer = data.get("answer", "").strip()
    is_popular = 1 if data.get("is_popular", True) else 0

    if not question or not answer:
        return jsonify({"error": "Question and Answer are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO faqs (category, question, answer, is_popular) VALUES (?, ?, ?, ?)",
                   (category, question, answer, is_popular))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({"message": "FAQ added successfully", "id": new_id}), 201


@faq_kb_bp.route("/faqs/<int:faq_id>", methods=["DELETE"])
@admin_required
def delete_faq(faq_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM faqs WHERE id = ?", (faq_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        return jsonify({"error": "FAQ not found"}), 404

    return jsonify({"message": "FAQ deleted successfully"}), 200


# Knowledge Base (University Info) Endpoints
@faq_kb_bp.route("/university-info", methods=["GET"])
def get_university_info():
    category = request.args.get("category")
    query = request.args.get("q", "").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    if category:
        cursor.execute("SELECT * FROM knowledge_base WHERE category = ? ORDER BY title ASC", (category,))
    elif query:
        search_pattern = f"%{query}%"
        cursor.execute("SELECT * FROM knowledge_base WHERE title LIKE ? OR content LIKE ? OR keywords LIKE ? ORDER BY title ASC",
                       (search_pattern, search_pattern, search_pattern))
    else:
        cursor.execute("SELECT * FROM knowledge_base ORDER BY category ASC, title ASC")

    rows = cursor.fetchall()
    conn.close()
    return jsonify({"articles": [dict(r) for r in rows]}), 200


@faq_kb_bp.route("/university-info", methods=["POST"])
@admin_required
def create_university_info():
    data = request.get_json() or {}
    category = data.get("category", "").strip()
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    keywords = data.get("keywords", "").strip()
    department_contact = data.get("department_contact", "").strip()

    if not category or not title or not content:
        return jsonify({"error": "Category, Title, and Content are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO knowledge_base (category, title, content, keywords, department_contact)
    VALUES (?, ?, ?, ?, ?)
    ''', (category, title, content, keywords, department_contact))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({"message": "Knowledge base article created successfully", "id": new_id}), 201


@faq_kb_bp.route("/university-info/<int:info_id>", methods=["PUT"])
@admin_required
def update_university_info(info_id):
    data = request.get_json() or {}
    category = data.get("category", "").strip()
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    keywords = data.get("keywords", "").strip()
    department_contact = data.get("department_contact", "").strip()

    if not category or not title or not content:
        return jsonify({"error": "Category, Title, and Content are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    UPDATE knowledge_base
    SET category = ?, title = ?, content = ?, keywords = ?, department_contact = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ''', (category, title, content, keywords, department_contact, info_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Knowledge base article not found"}), 404

    return jsonify({"message": "Knowledge base article updated successfully"}), 200


@faq_kb_bp.route("/university-info/<int:info_id>", methods=["DELETE"])
@admin_required
def delete_university_info(info_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM knowledge_base WHERE id = ?", (info_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Knowledge base article not found"}), 404

    return jsonify({"message": "Knowledge base article deleted successfully"}), 200
