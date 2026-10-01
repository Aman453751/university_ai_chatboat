import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database.seed import seed_database
from routes.auth_routes import auth_bp
from routes.chat_routes import chat_bp
from routes.student_routes import student_bp
from routes.attendance_routes import attendance_bp
from routes.faq_kb_routes import faq_kb_bp
from routes.feedback_routes import feedback_bp
from routes.admin_routes import admin_bp
from routes.community_routes import community_bp
from routes.ticket_routes import ticket_bp
from routes.notification_routes import notification_bp

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "abc_university_super_secret_jwt_key_2026")

# Enable CORS for frontend origins (React Vite dev server & production origins)
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(student_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(faq_kb_bp)
app.register_blueprint(feedback_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(community_bp)
app.register_blueprint(ticket_bp)
app.register_blueprint(notification_bp)

@app.route("/api/health")
@app.route("/health")
def health_check():
    return jsonify({
        "status": "ok",
        "service": "University Portal API",
        "database": "connected"
    }), 200

@app.route("/")
def index():
    return jsonify({
        "status": "ok",
        "service": "University Portal API",
        "version": "1.0.0",
        "health": "/api/health",
        "docs": "/api/faqs"
    }), 200

# Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    import traceback
    traceback.print_exc()
    return jsonify({"error": "An internal server error occurred. Please try again later."}), 500

if __name__ == "__main__":
    # Ensure database is seeded on startup
    seed_database()
    print("REGISTERED ROUTES:", [str(rule) for rule in app.url_map.iter_rules()])
    port = int(os.getenv("PORT", 5000))
    print(f"Starting ABC University AI Chatbot API on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)