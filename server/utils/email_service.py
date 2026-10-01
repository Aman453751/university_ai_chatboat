import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def generate_otp():
    """Generates a secure 6-digit OTP code."""
    return f"{random.randint(100000, 999999)}"

def send_otp_email(to_email, otp):
    """
    Sends an OTP verification email to the user via SMTP.
    Returns True if email was successfully handed to SMTP server.
    Returns False if SMTP delivery fails or credentials are not configured.
    """
    email_host = os.getenv("EMAIL_HOST", "smtp.gmail.com").strip()
    email_port_str = os.getenv("EMAIL_PORT", "587").strip()
    email_user = os.getenv("EMAIL_USER", "").strip()
    email_pass = os.getenv("EMAIL_PASSWORD", "").strip()

    try:
        email_port = int(email_port_str)
    except ValueError:
        email_port = 587

    if not email_host or not email_user or not email_pass:
        print("SMTP delivery failed: Missing EMAIL_HOST, EMAIL_USER, or EMAIL_PASSWORD environment variables.")
        return False

    subject = "ABC University Student Portal - Email Verification OTP"
    body = f"""Hello,

Your 6-digit Verification Code (OTP) for ABC University Student Portal registration is:

{otp}

This OTP is valid for 10 minutes. Please do not share this OTP with anyone.

If you did not request this registration code, please ignore this email.

Best regards,
ABC University IT Helpdesk
support@abcuniversity.edu
"""

    try:
        msg = MIMEMultipart()
        msg["From"] = email_user
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(email_host, email_port, timeout=15)
        server.starttls()
        server.login(email_user, email_pass)
        server.send_message(msg)
        server.quit()
        print(f"Successfully delivered OTP email via SMTP to {to_email}")
        return True
    except Exception as e:
        print(f"SMTP delivery exception for {to_email}: {type(e).__name__} - {e}")
        return False

