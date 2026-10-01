import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import werkzeug.security as security
from database.db import get_db_connection, init_db

def create_initial_student_attendance(cursor, user_db_id, course="B.Tech Computer Science"):
    """
    Creates realistic subject-wise attendance records for a student.
    """
    if "Information Technology" in course or "IT" in course:
        subjects = [
            ("Object Oriented Programming", "IT301", 40, 38, 2),
            ("Digital Electronics & Logic Design", "IT302", 35, 31, 4),
            ("Discrete Mathematics", "MA301", 40, 37, 3),
            ("Data Structures", "IT303", 42, 39, 3),
            ("Database Systems", "IT304", 38, 35, 3),
        ]
    else:
        subjects = [
            ("Data Structures & Algorithms", "CS501", 40, 35, 5),
            ("Database Management Systems", "CS502", 38, 34, 4),
            ("Operating Systems", "CS503", 42, 32, 10),
            ("Computer Networks", "CS504", 36, 33, 3),
            ("Cyber Security & Ethics", "CS505", 30, 29, 1),
        ]

    total_attended = 0
    total_classes_all = 0

    for sub, code, total, attended, absent in subjects:
        pct = round((attended / total) * 100.0, 1) if total > 0 else 0.0
        total_attended += attended
        total_classes_all += total
        cursor.execute('''
        INSERT INTO attendance (student_id, subject, subject_code, total_classes, attended_classes, absent_classes, attendance_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_db_id, sub, code, total, attended, absent, pct))

    overall_pct = round((total_attended / total_classes_all) * 100.0, 1) if total_classes_all > 0 else 0.0
    cursor.execute("UPDATE users SET attendance_pct = ? WHERE id = ?", (overall_pct, user_db_id))
    return overall_pct


def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Populate community posts if community_posts table is empty
    cursor.execute("SELECT COUNT(*) FROM community_posts")
    if cursor.fetchone()[0] == 0:
        cursor.execute("SELECT id, name FROM users WHERE role = 'student' LIMIT 1")
        st_row = cursor.fetchone()
        author_id = st_row["id"] if st_row else 1
        author_name = st_row["name"] if st_row else "Aman Choudhary"

        posts = [
            ("Morning Mindfulness", "What is one small thing you can notice today that usually goes unseen?", "Daily Prompt", 124, 42),
            ("10,000 Collective Study Sessions", "Our student community just hit a major academic study milestone! Thank you everyone for participating in group sessions.", "Milestones", 389, 87),
            ("The Art of Digital Sunset Before Exams", "Try turning off all screens 45 minutes before sleep during exam week. Read a physical book or try light stretching for circadian recovery.", "Study Tips", 215, 34)
        ]

        for title, content, cat, likes, comments in posts:
            cursor.execute("""
                INSERT INTO community_posts (user_id, author_name, author_role, title, content, category, likes_count, comments_count)
                VALUES (?, ?, 'Student', ?, ?, ?, ?, ?)
            """, (author_id, author_name, title, content, cat, likes, comments))
        conn.commit()

    # Check if users already seeded
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        conn.close()
        print("Database already seeded.")
        return

    print("Seeding database with ABC University demo data...")



    # 1. Seed Demo Users (Student and Admin)
    student_pass = security.generate_password_hash("student123")
    admin_pass = security.generate_password_hash("admin123")

    cursor.execute('''
    INSERT INTO users (student_id, name, email, password_hash, role, course, branch, semester, section, phone, attendance_pct, fee_status, email_verified)
    VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, ?, 1)
    ''', ("STU1001", "Aman Choudhary", "student101@abcuniversity.edu", student_pass, "B.Tech Computer Science", "CSE", "Semester 5", "Section A", "+91-9876543210", 87.6, "Paid"))
    user1_id = cursor.lastrowid
    create_initial_student_attendance(cursor, user1_id, "B.Tech Computer Science")

    cursor.execute('''
    INSERT INTO users (student_id, name, email, password_hash, role, course, branch, semester, section, phone, attendance_pct, fee_status, email_verified)
    VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, ?, 1)
    ''', ("STU1002", "Priya Patel", "priya@abcuniversity.edu", student_pass, "B.Tech Information Technology", "IT", "Semester 3", "Section B", "+91-9876543211", 92.2, "Pending"))
    user2_id = cursor.lastrowid
    create_initial_student_attendance(cursor, user2_id, "B.Tech Information Technology")

    cursor.execute('''
    INSERT INTO users (student_id, name, email, password_hash, role, course, branch, semester, section, phone, attendance_pct, fee_status, email_verified)
    VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, ?, ?, ?, ?, 1)
    ''', ("ADM001", "University Administrator", "admin@abcuniversity.edu", admin_pass, "Administration", "Admin", "N/A", "N/A", "+91-120-4567000", 100.0, "N/A"))


    # 2. Seed Knowledge Base (18 Categories)
    kb_items = [
        # 1. Admissions
        ("Admissions", "Undergraduate & Postgraduate Admission Process 2026-2027",
         "ABC University offers admissions to B.Tech, M.Tech, BCA, MCA, BBA, and MBA programs.\n"
         "- **Eligibility for B.Tech**: Minimum 60% aggregate in 10+2 with Physics, Chemistry, and Mathematics. Valid score in JEE Main or ABC University Entrance Test (ABCET).\n"
         "- **Application Deadline**: Phase 1 closes on June 15th, 2026. Phase 2 closes on July 20th, 2026.\n"
         "- **How to Apply**: Visit the official admission portal at admissions.abcuniversity.edu, complete the registration form, upload transcripts, and pay the application fee of ₹1,200.\n"
         "- **Documents Required**: 10th & 12th Marksheets, JEE / ABCET Scorecard, Transfer Certificate, Migration Certificate, and Category Certificate (if applicable).",
         "admission eligibility apply deadline entrance test fee documents requirements",
         "Admissions Office | Email: admissions@abcuniversity.edu | Helpline: +91-120-4567001"),

        # 2. Academics
        ("Academics", "Academic Calendar, Grading System & Credit Framework",
         "ABC University follows a Choice Based Credit System (CBCS) across all academic programs.\n"
         "- **Academic Calendar**: Autumn Semester runs from August to December. Spring Semester runs from January to May.\n"
         "- **Grading System**: 10-point SGPA/CGPA scale.\n"
         "  * O (Outstanding): 10.0\n"
         "  * A+ (Excellent): 9.0\n"
         "  * A (Very Good): 8.0\n"
         "  * B+ (Good): 7.0\n"
         "  * B (Above Average): 6.0\n"
         "  * C (Average): 5.0\n"
         "  * F (Fail): Below 4.0\n"
         "- **Credit Requirement**: B.Tech requires a minimum of 160 credits over 8 semesters for degree completion.",
         "academic calendar grading credit system cgpa sgpa semester duration",
         "Academic Affairs Office | Email: academics@abcuniversity.edu | Phone: +91-120-4567002"),

        # 3. Departments
        ("Departments", "Academic Departments and Head of Departments (HoDs)",
         "ABC University comprises 6 major academic departments:\n"
         "1. **Computer Science & Engineering (CSE)** - HoD: Dr. Ramesh Kumar (cse.hod@abcuniversity.edu)\n"
         "2. **Information Technology (IT)** - HoD: Dr. Sunita Verma (it.hod@abcuniversity.edu)\n"
         "3. **Electronics & Communication (ECE)** - HoD: Dr. Vikram Singh (ece.hod@abcuniversity.edu)\n"
         "4. **Mechanical Engineering (ME)** - HoD: Dr. Rajesh Gupta (me.hod@abcuniversity.edu)\n"
         "5. **Civil Engineering (CE)** - HoD: Dr. Ananya Sen (ce.hod@abcuniversity.edu)\n"
         "6. **School of Management Studies (SMS)** - HoD: Dr. Meenakshi Joshi (management.hod@abcuniversity.edu)",
         "departments hod computer science it mechanical civil electronics management faculty heads",
         "Dean of Academics | Email: dean.academics@abcuniversity.edu | Phone: +91-120-4567003"),

        # 4. Courses
        ("Courses", "Offered Programs, Syllabus & Course Registration Rules",
         "Course registration takes place at the start of each semester via the Student Portal.\n"
         "- **Core B.Tech Courses (CSE)**: Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, Artificial Intelligence, Web Technologies, Software Engineering.\n"
         "- **Electives Offered**: Cloud Computing, Cyber Security, Machine Learning, DevOps, Mobile App Development, Blockchain.\n"
         "- **Course Add/Drop Deadline**: Students may add or drop electives within the first two weeks of class start.",
         "courses syllabus elective core subjects registration add drop subject list",
         "Course Registration Cell | Email: registration@abcuniversity.edu"),

        # 5. Examinations
        ("Examinations", "Mid-Term & End-Term Examination Guidelines",
         "Examinations are conducted twice per semester: Mid-Semester Exams (Weightage 30%) and End-Semester Exams (Weightage 50%). Continuous Internal Evaluation accounts for 20%.\n"
         "- **Mid-Term Exams**: Conducted in October (Autumn) and March (Spring).\n"
         "- **End-Term Exams**: Conducted in December (Autumn) and May (Spring).\n"
         "- **Admit Card**: Examination Admit Cards must be downloaded from the student portal 5 days prior to exams after clearing fee dues and verifying attendance (>75%).\n"
         "- **Exam Form Deadline**: Examination form submission closes 15 days before exam start date.",
         "examinations exam schedule mid-term end-term admit card exam form hall ticket date",
         "Examination Controller Cell | Email: exams@abcuniversity.edu | Room 104, Admin Block"),

        # 6. Results
        ("Results", "Result Declaration, Marksheets & Re-evaluation Policy",
         "Semester examination results are declared within 30 days of exam completion on the official portal.\n"
         "- **Result Access**: Log in to student dashboard using Student ID and Password.\n"
         "- **Re-evaluation / Answer Sheet Inspection**: Students unsatisfied with marks can apply for re-evaluation within 10 days of result declaration.\n"
         "- **Re-evaluation Fee**: ₹500 per subject.\n"
         "- **Supplementary Exams**: Conducted in July every year for students clearing backlog subjects.",
         "results grades marksheets transcript re-evaluation rechecking supplementary backlog",
         "Controller of Examinations | Email: results@abcuniversity.edu"),

        # 7. Attendance
        ("Attendance", "Attendance Policy & Shortage Rules",
         "ABC University strictly enforces attendance rules:\n"
         "- **Minimum Mandatory Attendance**: 75% overall in each subject to be eligible for End-Semester Examinations.\n"
         "- **Condonation of Shortage**: Attendance between 65% and 74% may be condoned by the Dean on valid medical grounds or official university event representation with supporting proof.\n"
         "- **De-registration**: Attendance below 65% leads to automatic de-registration ('F' grade / detainment in that course).",
         "attendance percentage mandatory 75 rule medical condonation detainment shortage",
         "Student Welfare Office | Email: dean.welfare@abcuniversity.edu | Phone: +91-120-4567005"),

        # 8. Fees
        ("Fees", "Tuition Fee Structure, Payment Deadlines & Online Payment Portal",
         "Semester fees must be paid before the commencement of each semester.\n"
         "- **B.Tech Tuition Fee**: ₹65,000 per semester.\n"
         "- **Development & Lab Fee**: ₹12,000 per semester.\n"
         "- **Late Payment Fine**: ₹100 per day after the due date up to a maximum of 15 days.\n"
         "- **Payment Modes**: Online via Credit Card, Debit Card, Netbanking, UPI on feeportal.abcuniversity.edu, or Demand Draft payable to 'ABC University'.",
         "fees tuition fee payment due date fine netbanking upi payment portal demand draft",
         "Accounts & Finance Office | Email: finance@abcuniversity.edu | Window 3, Admin Building"),

        # 9. Scholarships
        ("Scholarships", "Merit, Need-based & Government Scholarship Schemes",
         "ABC University provides multiple financial aid options:\n"
         "1. **Merit Scholarship**: 50% tuition waiver for top 5% rank holders in university examinations (CGPA >= 9.0).\n"
         "2. **Need-Based Scholarship**: Financial assistance for students with family income < ₹3.0 Lakh per annum.\n"
         "3. **Sports Scholarship**: 25% to 100% waiver for state/national level athletes.\n"
         "4. **Government Scholarships**: Central Sector Scheme, Post-Matric SC/ST/OBC Scholarships supported via National Scholarship Portal (NSP).\n"
         "- **Application Deadline**: September 30th annually.",
         "scholarships merit waiver financial assistance sports scholarship nsp scholarship apply",
         "Scholarship & Aid Cell | Email: scholarships@abcuniversity.edu"),

        # 10. Hostel
        ("Hostel", "Hostel Accommodation, Facilities, Rules & Mess Timings",
         "ABC University has 4 Boys Hostels (BH-1 to BH-4) and 3 Girls Hostels (GH-1 to GH-3) inside campus.\n"
         "- **Facilities**: 24/7 Wi-Fi, laundry room, power backup, study rooms, gymnasium, indoor games.\n"
         "- **Hostel Charges**: Single Seater: ₹45,000/sem | Double Seater: ₹35,000/sem (Includes Mess).\n"
         "- **Mess Timings**:\n"
         "  * Breakfast: 7:30 AM - 9:30 AM\n"
         "  * Lunch: 12:30 PM - 2:30 PM\n"
         "  * Snacks: 5:00 PM - 6:00 PM\n"
         "  * Dinner: 7:30 PM - 9:30 PM\n"
         "- **Curfew Time**: 10:00 PM (Girls & Boys Hostels). Night out gate pass required from Chief Warden.",
         "hostel mess room accommodation curfew fee warden single double seater mess timings",
         "Chief Hostel Warden | Email: warden@abcuniversity.edu | Phone: +91-120-4567010"),

        # 11. Library
        ("Library", "Central Library Timings, Digital Resources & Book Issuance Rules",
         "The Central Library houses over 80,000 books, e-journals, IEEE Xplore, ScienceDirect access, and silent reading zones.\n"
         "- **Opening Hours**: Monday to Friday: 8:00 AM - 9:00 PM | Saturday & Sunday: 9:00 AM - 5:00 PM (Extended till 11:00 PM during exams).\n"
         "- **Borrowing Limit**: 4 books for UG students for 14 days; 6 books for PG students.\n"
         "- **Late Return Fine**: ₹5 per book per day.\n"
         "- **Digital Library**: Remote access available via library.abcuniversity.edu using student credentials.",
         "library books timing borrowing issuance digital library ieee search reading hall fine",
         "Central Library Office | Email: library@abcuniversity.edu | Phone: +91-120-4567011"),

        # 12. Transport
        ("Transport", "University Bus Routes, Timings & Transport Pass",
         "ABC University operates a fleet of 25 air-conditioned buses connecting Ghaziabad, Delhi, Noida, and Greater Noida.\n"
         "- **Bus Timing**: Buses arrive at campus by 8:30 AM and depart at 5:15 PM daily.\n"
         "- **Transport Fee**: ₹18,000 per academic year.\n"
         "- **Bus Pass Issuance**: Apply online via transport.abcuniversity.edu or visit the Transport Desk in Block C.",
         "transport bus route pass timing fee pickup schedule vehicle commute",
         "Transport Manager | Email: transport@abcuniversity.edu | Phone: +91-120-4567012"),

        # 13. Placements
        ("Placements", "Placement Statistics, Top Recruiters & Training Cell",
         "The Training & Placement Cell (TPC) assists final year students with recruitment drives, resume reviews, and mock interviews.\n"
         "- **Placement Statistics (2025)**: 94.2% Placement Rate. Highest Package: ₹44 LPA (Microsoft). Average Package: ₹8.5 LPA.\n"
         "- **Top Recruiters**: Microsoft, Amazon, TCS, Infosys, Wipro, Cognizant, Accenture, Deloitte, Capgemini, L&T.\n"
         "- **Placement Eligibility**: Minimum 6.5 CGPA with no active backlogs.\n"
         "- **Registration**: Final year students must register on placement portal tpc.abcuniversity.edu by August 1st.",
         "placements placement cell package recruiters highest average placement eligibility company tpc",
         "Training & Placement Cell | Email: placement@abcuniversity.edu | Phone: +91-120-4567013"),

        # 14. Internships
        ("Internships", "Summer Internship Policy, NOC & Industry Collaborations",
         "All 3rd-year B.Tech and 1st-year MCA/MBA students must undergo a mandatory 6-8 week Summer Internship.\n"
         "- **No Objection Certificate (NOC)**: Download from student portal after internship offer verification by TPC.\n"
         "- **Stipend Range**: ₹15,000 - ₹60,000/month across partner companies.\n"
         "- **Evaluation**: Internship report submission and viva conducted in 7th semester.",
         "internship summer noc stipend industrial training training letter placement cell",
         "Internship Desk | Email: internships@abcuniversity.edu"),

        # 15. Events
        ("Events", "Annual Cultural Fest, Tech Fest & Notices",
         "ABC University organizes major national-level events throughout the academic year:\n"
         "- **TechnoBYTE (Annual Tech Fest)**: October 14-16, 2026. Features Hackathons, Robotics, Coding Competitions, and Guest Keynotes.\n"
         "- **UDBHAV (Annual Cultural Fest)**: February 20-22, 2027. Music, Dance, Fashion Show, Pro-Nites.\n"
         "- **SPARDHA (Annual Sports Meet)**: March 10-12, 2027. Cricket, Football, Athletics, Badminton, Chess.",
         "events technobyte udbhav fest cultural tech sports meet hackathon club activity",
         "Student Cultural Committee | Email: events@abcuniversity.edu"),

        # 16. Campus Facilities
        ("Campus Facilities", "Cafeteria, Medical Center, Gymnasium & Sports Infrastructure",
         "ABC University provides state-of-the-art infrastructure across its 50-acre green campus:\n"
         "- **Medical Center**: 24/7 OPD with resident doctor & emergency ambulance service (Near Gate 2).\n"
         "- **Cafeterias**: Main Food Court, Cafe Coffee Day, Nescafe Kiosk, Juice Corner.\n"
         "- **Sports Complex**: Football Ground, Basketball Courts, Lawn Tennis Court, Badminton Hall, Indoor Gymnasium.\n"
         "- **ATM & Bank**: Punjab National Bank branch and 24-hour ATM inside campus.",
         "facilities medical canteen cafeteria gym sports atm bank infrastructure wifi campus",
         "Campus Admin Office | Email: campusadmin@abcuniversity.edu | Phone: +91-120-4567016"),

        # 17. Rules & Regulations
        ("Rules & Regulations", "Anti-Ragging Policy, Code of Conduct & Identity Cards",
         "ABC University maintains a strict zero-tolerance policy against misconduct and ragging:\n"
         "- **Anti-Ragging Policy**: Ragging is strictly illegal under Supreme Court guidelines. Complaints can be registered at antiragging@abcuniversity.edu or helpline 1800-180-5522.\n"
         "- **ID Card Policy**: Students must carry their physical RFID Student ID card at all times inside campus and present it upon security request.\n"
         "- **Substance Policy**: ABC University campus is a strictly alcohol, tobacco, and drug-free zone.",
         "rules regulations anti ragging disciplinary action ID card code of conduct policy security",
         "Disciplinary Committee | Email: discipline@abcuniversity.edu | Toll-Free: 1800-180-5522"),

        # 18. Contact Information
        ("Contact Information", "Key University Administrative Contacts & Location",
         "**ABC University Campus**\n"
         "Address: Knowledge Park III, Delhi-NCR, Ghaziabad, Uttar Pradesh - 201306, India.\n"
         "- **General Helpline**: +91-120-4567000 / +91-120-4567001\n"
         "- **Admissions**: admissions@abcuniversity.edu | +91-120-4567001\n"
         "- **Examinations**: exams@abcuniversity.edu | +91-120-4567004\n"
         "- **Student Support / Helpdesk**: support@abcuniversity.edu | +91-120-4567005\n"
         "- **Website**: www.abcuniversity.edu",
         "contact phone email address location helpline support location map hours office",
         "Central Helpdesk | Email: support@abcuniversity.edu | Phone: +91-120-4567000")
    ]

    for cat, title, content, keywords, contact in kb_items:
        cursor.execute('''
        INSERT INTO knowledge_base (category, title, content, keywords, department_contact)
        VALUES (?, ?, ?, ?, ?)
        ''', (cat, title, content, keywords, contact))

    # 3. Seed FAQs (Popular Student Questions)
    faqs = [
        ("Admissions", "How can I apply for admission?",
         "You can apply for admission online by visiting admissions.abcuniversity.edu. Register yourself, fill out the application form, upload required 10th/12th marksheets, and submit the ₹1,200 application fee online.", 1),

        ("Academics", "What courses does the university offer?",
         "ABC University offers undergraduate and postgraduate courses in Computer Science, Information Technology, Electronics, Mechanical, Civil Engineering, and Management (B.Tech, M.Tech, BCA, MCA, BBA, MBA).", 1),

        ("Results", "How can I check my result?",
         "Log in to your Student Dashboard using your Student ID and Password. Navigate to the 'Results' section to view semester-wise SGPA, CGPA, and subject marks.", 1),

        ("Fees", "How do I pay my fees?",
         "Fees can be paid online via Credit Card, Debit Card, Netbanking, or UPI on feeportal.abcuniversity.edu. You can also pay via Demand Draft at Window 3 of the Admin Building.", 1),

        ("Scholarships", "What scholarships are available?",
         "ABC University offers Merit Scholarships (up to 50% waiver for CGPA >= 9.0), Need-based Financial Aid, Sports Scholarships, and supports Government National Scholarships (NSP).", 1),

        ("Examinations", "Where can I find the exam schedule?",
         "The examination schedule is published on the Student Portal under 'Exams' 3 weeks prior to exams. Mid-term exams take place in Oct/March and End-term in Dec/May.", 1),

        ("Attendance", "What is the minimum attendance requirement?",
         "The minimum mandatory attendance required is 75% in each course. Shortage up to 65% may be condoned by the Dean only on official medical grounds.", 1),

        ("Hostel", "How can I apply for hostel accommodation?",
         "Hostel allotment applications are submitted online during admission or at the Chief Hostel Warden's office before semester start. Hostel fee is ₹35,000 (double) to ₹45,000 (single) including mess.", 1),

        ("Placements", "How can I contact the placement cell?",
         "You can reach the Training & Placement Cell (TPC) at placement@abcuniversity.edu or visit the TPC office on the 2nd Floor of Block A. Helpline: +91-120-4567013.", 1),

        ("Library", "What are the library timings?",
         "Central Library is open Monday to Friday from 8:00 AM to 9:00 PM, and Saturday/Sunday from 9:00 AM to 5:00 PM. Hours are extended till 11:00 PM during exams.", 1),

        ("Transport", "How can I get a university bus pass?",
         "Bus passes can be obtained by filling the transport form on transport.abcuniversity.edu or at the Transport Counter in Block C. Annual transport fee is ₹18,000.", 0),

        ("Rules & Regulations", "What is the anti-ragging helpline number?",
         "ABC University has zero tolerance for ragging. Contact anti-ragging cell at antiragging@abcuniversity.edu or call the 24/7 toll-free helpline 1800-180-5522.", 0)
    ]

    for cat, q, a, pop in faqs:
        cursor.execute('''
        INSERT INTO faqs (category, question, answer, is_popular)
        VALUES (?, ?, ?, ?)
        ''', (cat, q, a, pop))

    # 4. Seed Exams
    exams = [
        ("B.Tech Computer Science", "Semester 5", "Data Structures & Algorithms", "2026-12-05", "10:00 AM - 1:00 PM", "Exam Hall A, Block B"),
        ("B.Tech Computer Science", "Semester 5", "Database Management Systems", "2026-12-08", "10:00 AM - 1:00 PM", "Exam Hall B, Block B"),
        ("B.Tech Computer Science", "Semester 5", "Operating Systems", "2026-12-11", "10:00 AM - 1:00 PM", "Exam Hall A, Block B"),
        ("B.Tech Computer Science", "Semester 5", "Computer Networks", "2026-12-15", "10:00 AM - 1:00 PM", "Exam Hall C, Block B"),
        ("B.Tech Information Technology", "Semester 3", "Object Oriented Programming", "2026-12-06", "02:00 PM - 5:00 PM", "Exam Hall D, Block A")
    ]

    for crs, sem, sub, dt, tm, vne in exams:
        cursor.execute('''
        INSERT INTO exams (course, semester, subject, exam_date, exam_time, venue)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (crs, sem, sub, dt, tm, vne))

    # 5. Seed Notices
    notices = [
        ("Autumn 2026 End-Term Examination Schedule Released", "The detailed date sheet for End-Semester Examinations December 2026 is now available on the portal. Please download your hall tickets.", "Examinations", "2026-10-01"),
        ("TechnoBYTE 2026 Registration Open", "ABC University's annual tech festival TechnoBYTE registration opens today. Register your teams for Hackathon and Robotics events.", "Events", "2026-09-28"),
        ("Scholarship Application Deadline Reminder", "Merit and Need-based scholarship applications must be submitted by September 30th with all supporting income certificates.", "Scholarships", "2026-09-20"),
        ("Library Extended Hours During Exams", "Central Library will remain open until 11:00 PM starting November 25th to assist students with examination preparation.", "Library", "2026-09-15")
    ]

    for title, content, cat, dt in notices:
        cursor.execute('''
        INSERT INTO notices (title, content, category, date)
        VALUES (?, ?, ?, ?)
        ''', (title, content, cat, dt))

    # 6. Seed Student Deadlines
    cursor.execute("SELECT COUNT(*) FROM student_deadlines")
    if cursor.fetchone()[0] == 0:
        deadlines = [
            (user1_id, "End-Term Exam Hall Ticket Download", "Download examination admit card from student portal after clearing fee dues.", "Examinations", "2026-10-02", "High", "Due Tomorrow"),
            (user1_id, "DBMS Lab Project Submission", "Submit final project report & database schema diagram for DBMS Lab.", "Academics", "2026-10-04", "Medium", "Upcoming"),
            (user1_id, "Merit Scholarship Renewal", "Submit semester 4 marksheet & income certificate for fee waiver renewal.", "Scholarships", "2026-10-08", "High", "Upcoming"),
            (user1_id, "Library Book Return (Data Structures)", "Return borrowed textbook 'Data Structures using C++' to central library.", "Library", "2026-10-12", "Low", "Upcoming")
        ]
        for uid, title, desc, cat, dl, prio, st in deadlines:
            cursor.execute('''
            INSERT INTO student_deadlines (user_id, title, description, category, deadline, priority, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (uid, title, desc, cat, dl, prio, st))

    # 7. Seed Support Tickets
    cursor.execute("SELECT COUNT(*) FROM support_tickets")
    if cursor.fetchone()[0] == 0:
        tickets = [
            ("TICK-1024", user1_id, "Aman Choudhary", "STU1001", "Fee payment deducted from bank account but portal status shows pending.", "Finance & Fees", "High", "Open"),
            ("TICK-1019", user1_id, "Aman Choudhary", "STU1001", "Attendance discrepancy in Database Systems lab on Sep 22nd.", "Academics", "Medium", "In Progress"),
            ("TICK-1005", user1_id, "Aman Choudhary", "STU1001", "Library digital portal login credentials reset requested.", "Library", "Low", "Resolved")
        ]
        for tcode, uid, sname, sid, issue, cat, prio, st in tickets:
            cursor.execute('''
            INSERT INTO support_tickets (ticket_code, user_id, student_name, student_id, issue, category, priority, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (tcode, uid, sname, sid, issue, cat, prio, st))

    # 8. Seed Saved Answers
    cursor.execute("SELECT COUNT(*) FROM saved_answers")
    if cursor.fetchone()[0] == 0:
        saved = [
            (user1_id, "End-Term Examination Schedule", "Mid-term exams run Oct 14-20, 2026. End-term exams start Dec 5, 2026. Admit cards released 5 days prior.", "Examinations"),
            (user1_id, "Tuition Fee Structure & Modes", "B.Tech Tuition Fee is ₹65,000/sem. Development Fee: ₹12,000/sem. Payable via netbanking, UPI, or DD.", "Fees")
        ]
        for uid, title, content, cat in saved:
            cursor.execute('''
            INSERT INTO saved_answers (user_id, title, content, category)
            VALUES (?, ?, ?, ?)
            ''', (uid, title, content, cat))

    conn.commit()
    conn.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
