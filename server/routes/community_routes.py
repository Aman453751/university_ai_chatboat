from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from utils.auth import token_required

community_bp = Blueprint("community", __name__, url_prefix="/api/community")

@community_bp.route("/posts", methods=["GET"])
def get_posts():
    """Returns list of community posts with likes and comment counts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, user_id, author_name, author_role, title, content, category, likes_count, comments_count, created_at
        FROM community_posts
        ORDER BY id DESC
    """)
    rows = cursor.fetchall()
    posts = [dict(r) for r in rows]
    conn.close()
    return jsonify({"posts": posts}), 200


@community_bp.route("/posts", methods=["POST"])
@token_required
def create_post():
    """Creates a new community post from authenticated user."""
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    category = data.get("category", "Mindfulness & Study").strip()

    if not title or not content:
        return jsonify({"error": "Title and content are required for a post"}), 400

    user = request.current_user
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO community_posts (user_id, author_name, author_role, title, content, category)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user["id"], user["name"], "Student", title, content, category))

    post_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM community_posts WHERE id = ?", (post_id,))
    new_post = dict(cursor.fetchone())
    conn.close()

    return jsonify({"message": "Post created successfully", "post": new_post}), 201


@community_bp.route("/posts/<int:post_id>/like", methods=["POST"])
@token_required
def like_post(post_id):
    """Increments likes count for a community post."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?", (post_id,))
    conn.commit()

    cursor.execute("SELECT likes_count FROM community_posts WHERE id = ?", (post_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Post not found"}), 404

    return jsonify({"likes_count": row["likes_count"]}), 200


@community_bp.route("/posts/<int:post_id>/comments", methods=["GET"])
def get_comments(post_id):
    """Returns list of comments for a specific post."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, post_id, user_id, author_name, content, created_at
        FROM community_comments
        WHERE post_id = ?
        ORDER BY id ASC
    """, (post_id,))
    rows = cursor.fetchall()
    comments = [dict(r) for r in rows]
    conn.close()

    return jsonify({"comments": comments}), 200


@community_bp.route("/posts/<int:post_id>/comments", methods=["POST"])
@token_required
def add_comment(post_id):
    """Adds a comment to a community post."""
    data = request.get_json() or {}
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"error": "Comment content cannot be empty"}), 400

    user = request.current_user
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO community_comments (post_id, user_id, author_name, content)
        VALUES (?, ?, ?, ?)
    """, (post_id, user["id"], user["name"], content))

    cursor.execute("UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Comment added successfully"}), 201
