from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import werkzeug.security as security
import re

from database.db import get_db_connection
from database.seed import create_initial_student_attendance
from utils.auth import generate_token, token_required
from utils.email_service import generate_otp, send_otp_email
from services.vapid_service import send_system_notification

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def is_valid_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, email))

@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    """
    Step 1 of registration flow: Generates and sends a 6-digit OTP code to the entered email.
    Stores hashed OTP, expiry, and attempt count on server.
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    name = data.get("name", "").strip()
    student_id = data.get("student_id", "").strip().upper()

    if not email or not is_valid_email(email):
        return jsonify({"error": "Please enter a valid email address"}), 400

    if not name or not student_id:
        return jsonify({"error": "Full Name and Student ID are required to send verification OTP"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if student_id or email is already registered in database
    cursor.execute("SELECT id FROM users WHERE student_id = ? OR email = ?", (student_id, email))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "This Student ID or Email address is already registered"}), 400

    otp = generate_otp()
    otp_hash = security.generate_password_hash(otp)
    expires_at = (datetime.now() + timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S")

    # Invalidate previous OTP requests for this email
    cursor.execute("DELETE FROM otp_verifications WHERE email = ?", (email,))

    # Insert new OTP record
    cursor.execute("""
        INSERT INTO otp_verifications (email, otp_hash, expires_at, is_verified, attempts)
        VALUES (?, ?, ?, 0, 0)
    """, (email, otp_hash, expires_at))

    conn.commit()
    conn.close()

    # Send email via SMTP
    sent_success = send_otp_email(email, otp)

    if not sent_success:
        return jsonify({
            "error": "Failed to deliver OTP email via SMTP server. Please verify your email address or check server SMTP configuration."
        }), 500

    # Notification Trigger: OTP SENT (if user exists)
    try:
        conn_chk = get_db_connection()
        cur_chk = conn_chk.cursor()
        cur_chk.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = cur_chk.fetchone()
        conn_chk.close()
        if existing:
            send_system_notification(
                existing["id"],
                "ABES Student Portal",
                "Your email verification code has been sent.",
                link="/register",
                category="Security"
            )
    except Exception as e:
        print(f"Failed to send OTP sent notification: {e}")

    return jsonify({
        "message": f"A 6-digit OTP code has been sent to {email}. Valid for 10 minutes.",
        "email": email
    }), 200


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    """
    Step 2 of registration flow: Verifies the 6-digit OTP code against server storage.
    Enforces maximum attempt protection and expiration checks.
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    otp_input = str(data.get("otp", "")).strip()

    if not email or not otp_input:
        return jsonify({"error": "Email and 6-digit OTP code are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM otp_verifications WHERE email = ? ORDER BY id DESC LIMIT 1", (email,))
    record = cursor.fetchone()

    if not record:
        conn.close()
        return jsonify({"error": "No pending OTP verification found for this email. Please request a new OTP."}), 400

    # Rate limiting check
    if record["attempts"] >= 5:
        conn.close()
        return jsonify({"error": "Too many failed attempts. Please request a new OTP code."}), 429

    # Expiration check
    expiry_time = datetime.strptime(record["expires_at"], "%Y-%m-%d %H:%M:%S")
    if datetime.now() > expiry_time:
        conn.close()
        return jsonify({"error": "OTP has expired (valid for 10 minutes). Please request a new OTP code."}), 400

    # Verify OTP hash
    if not security.check_password_hash(record["otp_hash"], otp_input):
        cursor.execute("UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?", (record["id"],))
        conn.commit()
        conn.close()
        remaining = 5 - (record["attempts"] + 1)
        return jsonify({"error": f"Invalid OTP code. {remaining} attempt(s) remaining."}), 400

    # Mark as verified
    cursor.execute("UPDATE otp_verifications SET is_verified = 1 WHERE id = ?", (record["id"],))
    conn.commit()

    # Notification Trigger: OTP VERIFIED
    try:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()
        if existing:
            send_system_notification(
                existing["id"],
                "ABES Student Portal",
                "Your email address has been successfully verified.",
                link="/register",
                category="Security"
            )
    except Exception as e:
        print(f"Failed to send OTP verified notification: {e}")

    conn.close()

    return jsonify({
        "message": "OTP verified successfully. You may now create your account password.",
        "verified": True,
        "email": email
    }), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Step 3 of registration flow: Completes student registration after OTP verification.
    Hashes password, creates user record, and initializes subject attendance records.
    """
    data = request.get_json() or {}

    student_id = data.get("student_id", "").strip().upper()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    course = data.get("course", "B.Tech Computer Science").strip()
    branch = data.get("branch", "CSE").strip()
    semester = data.get("semester", "Semester 1").strip()
    section = data.get("section", "Section A").strip()
    phone = data.get("phone", "").strip()

    if not student_id or not name or not email or not password:
        return jsonify({"error": "Full Name, Student ID, Email, and Password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if email is verified via OTP
    cursor.execute("SELECT is_verified FROM otp_verifications WHERE email = ? AND is_verified = 1", (email,))
    otp_record = cursor.fetchone()
    if not otp_record:
        conn.close()
        return jsonify({"error": "Email has not been verified via OTP. Please verify your email first."}), 403

    # Check existing user
    cursor.execute("SELECT id FROM users WHERE student_id = ? OR email = ?", (student_id, email))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Student ID or Email is already registered"}), 400

    password_hash = security.generate_password_hash(password)

    cursor.execute("""
        INSERT INTO users (student_id, name, email, password_hash, role, course, branch, semester, section, phone, attendance_pct, fee_status, email_verified)
        VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, 100.0, 'Paid', 1)
    """, (student_id, name, email, password_hash, course, branch, semester, section, phone))

    new_id = cursor.lastrowid

    # Create initial subject-wise attendance records for the registered student
    create_initial_student_attendance(cursor, new_id, course)

    conn.commit()

    # Retrieve created student profile
    cursor.execute("SELECT id, student_id, name, email, role, course, branch, semester, section, phone, attendance_pct, fee_status FROM users WHERE id = ?", (new_id,))
    user_data = dict(cursor.fetchone())
    conn.close()

    token = generate_token(new_id, "student")

    # Real Event Notification: REGISTRATION
    try:
        send_system_notification(
            new_id,
            "ABES Student Portal",
            "Your ABES student account has been created successfully.",
            link="/dashboard",
            category="Registration"
        )
    except Exception as e:
        print(f"Failed to send registration push notification: {e}")

    return jsonify({
        "message": "Student registration completed successfully",
        "token": token,
        "user": user_data
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login endpoint using Email or Student ID + Password.
    Returns JWT authentication token and user profile.
    """
    data = request.get_json() or {}

    identifier = data.get("identifier", "").strip()
    password = data.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "Student ID / Email and password are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    clean_id = identifier.lower()
    alt_id = clean_id.replace("abesuniversity.edu", "abcuniversity.edu") if "abesuniversity.edu" in clean_id else clean_id.replace("abcuniversity.edu", "abesuniversity.edu")

    cursor.execute(
        "SELECT * FROM users WHERE student_id = ? OR LOWER(student_id) = ? OR email = ? OR email = ?",
        (identifier.upper(), clean_id, clean_id, alt_id)
    )
    user = cursor.fetchone()
    conn.close()

    if not user or not security.check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid credentials. Please check your Student ID/Email and password."}), 401

    user_dict = dict(user)
    del user_dict["password_hash"]

    token = generate_token(user_dict["id"], user_dict["role"])

    # Real Event Notification: LOGIN
    try:
        send_system_notification(
            user_dict["id"],
            "ABES Student Portal",
            "A new login to your ABES Student Portal account was detected.",
            link="/dashboard",
            category="Security"
        )
    except Exception as e:
        print(f"Failed to send login push notification: {e}")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user_dict
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Logout endpoint."""
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me():
    """Returns profile of currently authenticated student."""
    user_dict = dict(request.current_user)
    if "password_hash" in user_dict:
        del user_dict["password_hash"]
    return jsonify({"user": user_dict}), 200
