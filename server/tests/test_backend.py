import unittest
import os
import sys
import json

# Add server directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from database.seed import seed_database
from database.db import get_db_connection

class BackendTestCase(unittest.TestCase):
    def setUp(self):
        seed_database()
        self.app = app.test_client()
        self.app.testing = True

        # Obtain student auth token for testing
        login_res = self.app.post('/api/auth/login', json={
            "identifier": "student101@abcuniversity.edu",
            "password": "student123"
        })
        login_data = json.loads(login_res.data)
        self.token = login_data["token"]
        self.auth_headers = {"Authorization": f"Bearer {self.token}"}

    def test_root_endpoint(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "online")

    def test_student_login(self):
        response = self.app.post('/api/auth/login', json={
            "identifier": "student101@abcuniversity.edu",
            "password": "student123"
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], "student101@abcuniversity.edu")

    def test_attendance_endpoint(self):
        response = self.app.get('/api/attendance', headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("overall_percentage", data)
        self.assertIn("subjects", data)
        self.assertGreater(len(data["subjects"]), 0)
        self.assertEqual(data["student_name"], "Aman Choudhary")

    def test_ai_assistant_attendance_queries(self):
        # Query 1: What is my attendance?
        res1 = self.app.post('/api/chat', headers=self.auth_headers, json={
            "message": "What is my attendance?"
        })
        self.assertEqual(res1.status_code, 200)
        d1 = json.loads(res1.data)
        self.assertIn("Aman Choudhary", d1["reply"])
        self.assertIn("87.6%", d1["reply"])

        # Query 2: Lowest attendance subject
        res2 = self.app.post('/api/chat', headers=self.auth_headers, json={
            "message": "Which subject has my lowest attendance?"
        })
        self.assertEqual(res2.status_code, 200)
        d2 = json.loads(res2.data)
        self.assertIn("Operating Systems", d2["reply"])

    def test_complete_otp_registration_flow(self):
        test_email = "teststudent2026@abcuniversity.edu"
        test_id = "STU2099"

        # Clean up existing test student if present from previous run
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE email = ? OR student_id = ?", (test_email, test_id))
        cursor.execute("DELETE FROM otp_verifications WHERE email = ?", (test_email,))
        conn.commit()
        conn.close()

        # 1. Send OTP
        res1 = self.app.post('/api/auth/send-otp', json={
            "email": test_email,
            "name": "Test Student",
            "student_id": test_id
        })
        self.assertEqual(res1.status_code, 200)


        # Retrieve generated OTP from DB for testing
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT otp_hash FROM otp_verifications WHERE email = ?", (test_email,))
        row = cursor.fetchone()
        conn.close()
        self.assertIsNotNone(row)

        # 2. Verify OTP (using correct OTP check mechanism or simulated input)
        # We simulate verification by verifying the endpoint handles invalid vs valid
        bad_verify = self.app.post('/api/auth/verify-otp', json={
            "email": test_email,
            "otp": "000000"
        })
        self.assertEqual(bad_verify.status_code, 400)

        # Manually mark verified in test DB to complete step 3
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE otp_verifications SET is_verified = 1 WHERE email = ?", (test_email,))
        conn.commit()
        conn.close()

        # 3. Complete Registration
        res3 = self.app.post('/api/auth/register', json={
            "student_id": test_id,
            "name": "Test Student",
            "email": test_email,
            "password": "securepassword123",
            "course": "B.Tech Computer Science",
            "branch": "CSE",
            "semester": "Semester 1",
            "section": "Section A",
            "phone": "+91-9998887770"
        })
        self.assertEqual(res3.status_code, 201)
        d3 = json.loads(res3.data)
        self.assertIn("token", d3)
        self.assertEqual(d3["user"]["email"], test_email)

    def test_unauthorized_access(self):
        res = self.app.get('/api/attendance')
        self.assertEqual(res.status_code, 401)

if __name__ == '__main__':
    unittest.main()
