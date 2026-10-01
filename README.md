# 🎓 ABC University - AI-Powered Student Support Chatbot Platform

A production-ready, full-stack, responsive AI Chatbot platform designed for university students, administrative staff, and faculty. It helps students instantly retrieve information regarding admissions, course syllabi, examination schedules, result declarations, attendance tracking, tuition fees, scholarships, hostels, central library timings, bus transport, and placement cell statistics.

---

## 🌟 Key Features

1. **Modern AI Chat Assistant**:
   - 24/7 intelligent conversational interface with online status indicator.
   - Clean Markdown rendering (paragraphs, bullet points, numbered lists, links, contacts).
   - Knowledge Base source attribution badges for verified university data.
   - Interactive feedback buttons (👍 Helpful / 👎 Not Helpful) logged to database.
   - One-click quick-action query chips.

2. **Dual AI Engine Architecture**:
   - Connects to external LLM APIs (OpenAI / Gemini) when `AI_API_KEY` is provided.
   - Includes a smart local RAG + TF-IDF knowledge base fallback synthesizer when offline or without an API key, ensuring 100% functionality right out of the box.

3. **Student Profile Dashboard**:
   - Visual Attendance Percentage meter with 75% minimum eligibility warning.
   - Fee payment status badge ("Paid" / "Pending").
   - Official Examination Schedule timeline table (Subject, Date, Time, Venue).
   - Recent University Notices and upcoming campus events feed.

4. **18-Category Knowledge Base & FAQs Hub**:
   - Comprehensive coverage: Admissions, Academics, Departments, Courses, Examinations, Results, Attendance, Fees, Scholarships, Hostel, Library, Transport, Placements, Internships, Events, Campus Facilities, Rules & Regulations, Contact Information.
   - Interactive FAQ search directory with instant "Ask AI" buttons.

5. **Administrator Management Control Hub**:
   - System analytics dashboard (Total Students, Conversations, Queries Today, FAQs Count, Positive & Negative Feedback totals).
   - Full CRUD operations for Knowledge Base articles across all 18 categories.
   - FAQ manager, Notice publisher, Student records inspector, and Feedback log auditor.

6. **Authentication & Session Security**:
   - JWT-based authentication with bcrypt password hashing.
   - Pre-seeded instant demo logins for students and administrators.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, React Markdown, React Router DOM, Axios.
- **Backend**: Python 3.13, Flask 3.0, Flask-CORS, PyJWT, Werkzeug Security, Python-Dotenv.
- **Database**: SQLite3 (`university.db`) with automatic table creation & migrations.
- **AI RAG**: Custom TF-IDF / Keyword match knowledge synthesizer + OpenAI-compatible LLM connector.

---

## 📁 Project Directory Structure

```text
university-ai-chatbot/
│
├── client/                      # React Vite Frontend Application
│   ├── src/
│   │   ├── components/          # Navbar, Footer, Sidebar, ChatMessage
│   │   ├── context/             # AuthContext (JWT & User state)
│   │   ├── pages/               # Landing, Chatbot, Dashboard, FAQs, Auth, Admin
│   │   ├── services/            # Axios API Client
│   │   ├── App.jsx              # React Router Setup
│   │   ├── main.jsx             # Entry Point
│   │   └── index.css            # Tailwind & Custom Styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                      # Flask Backend REST API
│   ├── database/
│   │   ├── db.py                # SQLite Schema Initialization
│   │   ├── seed.py              # Seeding ABC University Demo Data
│   │   └── university.db        # SQLite Database File
│   ├── models/                  # Data Abstraction Models
│   ├── routes/                  # REST API Blueprints (Auth, Chat, Student, FAQ/KB, Admin, Feedback)
│   ├── services/
│   │   ├── ai_service.py        # LLM Connector & Smart Fallback Synthesizer
│   │   └── rag_service.py       # Knowledge Base Search Engine
│   ├── utils/
│   │   └── auth.py              # JWT Middleware & Token Helpers
│   ├── tests/
│   │   └── test_backend.py      # Automated Unit Tests
│   ├── app.py                   # Main Flask Entry Point
│   ├── requirements.txt         # Python Dependencies
│   ├── .env                     # Local Environment Secret Keys
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## 🔑 Demo Login Credentials

You can use these pre-seeded demo accounts to test the application immediately:

| User Role | Email / ID | Password | Access Level |
|---|---|---|---|
| **Student** | `student101@abcuniversity.edu` / `STU1001` | `student123` | Student Dashboard & Chatbot |
| **Admin** | `admin@abcuniversity.edu` / `ADM001` | `admin123` | Full Admin Management Hub & KB Editor |

---

## 🚀 Step-by-Step Installation & Run Instructions (Windows PowerShell)

### Prerequisites
- Node.js (v18 or higher) & npm
- Python (v3.10 or higher) & pip

---

### Step 1: Clone or Navigate to Project Directory
Open **Windows PowerShell** and navigate to the project root:
```powershell
cd d:\university_ai_chatbot
```

---

### Step 2: Set Up & Run Backend Server (Flask)

1. Navigate to the `server/` directory:
   ```powershell
   cd server
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install required Python packages:
   ```powershell
   pip install -r requirements.txt
   ```

4. Verify `.env` configuration (created automatically):
   ```env
   SECRET_KEY=abc_university_super_secret_jwt_key_2026
   AI_API_KEY=your_api_key_here
   AI_PROVIDER=generic
   PORT=5000
   FLASK_ENV=development
   ```

5. Seed the database with demo university data:
   ```powershell
   python database/seed.py
   ```

6. Run unit tests to verify API endpoints:
   ```powershell
   python tests/test_backend.py
   ```

7. Start the Flask server:
   ```powershell
   python app.py
   ```
   *The backend will start on `http://localhost:5000`.*

---

### Step 3: Set Up & Run Frontend Application (React + Vite)

Open a **new Windows PowerShell window**:

1. Navigate to the `client/` directory:
   ```powershell
   cd d:\university_ai_chatbot\client
   ```

2. Install npm dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   *The frontend application will launch on `http://localhost:5173`.*

---

## 🤖 Configuring Your AI API Key

The chatbot is configured to run out-of-the-box using the built-in **Smart Knowledge Base Synthesizer**. If you want to connect to an external LLM API (such as OpenAI GPT-3.5/4 or Google Gemini):

1. Open `server/.env` in your text editor.
2. Replace `your_api_key_here` with your actual API key:
   ```env
   AI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Restart the Flask server (`python app.py`). The system will automatically switch to LLM mode while retaining Knowledge Base context injection.

---

## 🔄 How to Replace Demo Data with Real University Data

1. **Via Admin Portal**:
   - Log in to `http://localhost:5173/login` using `admin@abcuniversity.edu` / `admin123`.
   - Go to **Admin Portal -> Knowledge Base Articles**.
   - Add, edit, or delete articles under any category (Admissions, Fees, Library, Exams, etc.).

2. **Via Database Seed Script**:
   - Edit `server/database/seed.py` and modify the `kb_items` list and `faqs` list with your university's real information.
   - Delete `server/database/university.db` and run `python database/seed.py`.

---

## 📡 REST API Documentation Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student account | No |
| `POST` | `/api/auth/login` | Log in student or admin | No |
| `GET` | `/api/auth/me` | Get current user profile | Yes (Bearer) |
| `POST` | `/api/chat` | Send message to AI chatbot | Yes (Bearer) |
| `GET` | `/api/chat/conversations` | List user chat sessions | Yes (Bearer) |
| `GET` | `/api/chat/conversations/:id` | Get messages for session | Yes (Bearer) |
| `PUT` | `/api/chat/conversations/:id` | Rename chat session | Yes (Bearer) |
| `DELETE` | `/api/chat/conversations/:id` | Delete chat session | Yes (Bearer) |
| `GET` | `/api/students/profile` | Get student dashboard stats | Yes (Bearer) |
| `GET` | `/api/faqs` | List FAQs by category | No |
| `GET` | `/api/university-info` | Search knowledge base | No |
| `POST` | `/api/feedback` | Submit 👍 / 👎 rating | Optional |
| `GET` | `/api/admin/statistics` | Admin overview analytics | Admin |
| `POST` | `/api/university-info` | Create KB article | Admin |
| `PUT` | `/api/university-info/:id` | Update KB article | Admin |
| `DELETE` | `/api/university-info/:id` | Delete KB article | Admin |

---

© 2026 ABC University. Built with React, Flask, and SQLite.
