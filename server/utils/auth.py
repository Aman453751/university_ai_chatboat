import os
import jwt
import datetime
from functools import wraps
from flask import request, jsonify
from database.db import get_db_connection

SECRET_KEY = os.getenv("SECRET_KEY", "abc_university_super_secret_jwt_key_2026")

def generate_token(user_id, role="student"):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Authentication token is missing. Please log in."}), 401

        payload = decode_token(token)
        if not payload or "user_id" not in payload:
            return jsonify({"error": "Invalid or expired token. Please log in again."}), 401

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, student_id, name, email, role, course, branch, semester, section, phone, attendance_pct, fee_status FROM users WHERE id = ?", (payload["user_id"],))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({"error": "Authenticated user record not found"}), 401

        request.current_user = dict(row)
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401

        payload = decode_token(token)
        if not payload or payload.get("role") != "admin":
            return jsonify({"error": "Admin privileges required"}), 403

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, student_id, name, email, role FROM users WHERE id = ?", (payload["user_id"],))
        current_user = cursor.fetchone()
        conn.close()

        if not current_user:
            return jsonify({"error": "User not found"}), 401

        request.current_user = dict(current_user)
        return f(*args, **kwargs)
    return decorated
