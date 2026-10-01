import os
import json
import base64
from pathlib import Path
try:
    from py_vapid import Vapid
    from pywebpush import webpush, WebPushException
    HAS_VAPID = True
except ImportError:
    HAS_VAPID = False
from cryptography.hazmat.primitives import serialization
from database.db import get_db_connection

ENV_FILE_PATH = Path(__file__).parent.parent / ".env"

def get_or_generate_vapid_keys():
    """
    Retrieves or automatically generates VAPID keys and updates server/.env
    """
    pub_key_b64 = os.getenv("VAPID_PUBLIC_KEY", "")
    priv_pem = os.getenv("VAPID_PRIVATE_KEY", "")
    claim_email = os.getenv("VAPID_CLAIM_EMAIL", "mailto:info@abes.ac.in")

    if not pub_key_b64 or not priv_pem:
        if not HAS_VAPID:
            return pub_key_b64, priv_pem, claim_email
        vapid = Vapid()
        vapid.generate_keys()

        # Extract 65-byte uncompressed EC public key
        pub_bytes = vapid.public_key.public_bytes(
            serialization.Encoding.X962,
            serialization.PublicFormat.UncompressedPoint
        )
        pub_key_b64 = base64.urlsafe_b64encode(pub_bytes).rstrip(b'=').decode('ascii')
        priv_pem = vapid.private_pem().decode('utf-8').replace('\n', '\\n')

        # Append or update .env file
        env_lines = []
        if ENV_FILE_PATH.exists():
            with open(ENV_FILE_PATH, "r", encoding="utf-8") as f:
                env_lines = f.readlines()

        # Filter existing keys
        new_lines = [l for l in env_lines if not l.startswith(("VAPID_PUBLIC_KEY=", "VAPID_PRIVATE_KEY=", "VAPID_CLAIM_EMAIL="))]
        new_lines.append(f"VAPID_PUBLIC_KEY={pub_key_b64}\n")
        new_lines.append(f"VAPID_PRIVATE_KEY=\"{priv_pem}\"\n")
        new_lines.append(f"VAPID_CLAIM_EMAIL={claim_email}\n")

        with open(ENV_FILE_PATH, "w", encoding="utf-8") as f:
            f.writelines(new_lines)

        os.environ["VAPID_PUBLIC_KEY"] = pub_key_b64
        os.environ["VAPID_PRIVATE_KEY"] = priv_pem.replace('\\n', '\n')
        os.environ["VAPID_CLAIM_EMAIL"] = claim_email

    return pub_key_b64, priv_pem.replace('\\n', '\n'), claim_email


def send_system_notification(user_id, title, message, link="/dashboard", category="System"):
    """
    1. Records in-app notification in SQLite 'notifications' table.
    2. Sends real-time Web Push notification to all active browser subscriptions of the authenticated student.
    3. Cleans up expired / unregistered browser subscriptions (404/410 errors).
    """
    if not user_id:
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Insert in-app notification record
    cursor.execute("""
        INSERT INTO notifications (user_id, title, message, category, link, is_read)
        VALUES (?, ?, ?, ?, ?, 0)
    """, (user_id, title, message, category, link))
    conn.commit()

    # 2. Fetch push subscriptions for user
    cursor.execute("SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?", (user_id,))
    subscriptions = cursor.fetchall()

    if not HAS_VAPID or not subscriptions:
        conn.close()
        return

    pub_key, priv_pem, claim_email = get_or_generate_vapid_keys()

    payload = json.dumps({
        "title": title,
        "body": message,
        "url": link,
        "category": category,
        "tag": f"abes-notif-{user_id}"
    })

    for sub in subscriptions:
        sub_info = {
            "endpoint": sub["endpoint"],
            "keys": {
                "p256dh": sub["p256dh"],
                "auth": sub["auth"]
            }
        }
        try:
            webpush(
                subscription_info=sub_info,
                data=payload,
                vapid_private_key=priv_pem,
                vapid_claims={"sub": claim_email},
                timeout=5
            )
        except WebPushException as ex:
            # If subscription expired or unregistered (404 / 410 Gone), remove from DB
            if ex.response and ex.response.status_code in [404, 410]:
                cursor.execute("DELETE FROM push_subscriptions WHERE id = ?", (sub["id"],))
                conn.commit()
            else:
                print(f"WebPush send error for endpoint {sub['endpoint']}: {ex}")
        except Exception as e:
            print(f"Push notification exception: {e}")

    conn.close()
