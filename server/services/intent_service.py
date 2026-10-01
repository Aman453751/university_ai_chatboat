import re

INTENT_PATTERNS = [
    ("exam_schedule", "📅 Exam Schedule", [
        r"exam", r"pariksha", r"date\s*sheet", r"schedule", r"test", r"admit\s*card",
        r"hall\t*ticket", r"mid-term", r"end-term", r"kab\s+se\s+hai", r"kahan\s+hoga"
    ]),
    ("fees", "💰 Fees", [
        r"fee", r"tuition", r"dues", r"payment", r"fine", r"penalty", r"paisa",
        r"cost", r"kist", r"installment", r"kitna\s+hai", r"jama"
    ]),
    ("attendance", "📊 Attendance", [
        r"attendance", r"absent", r"present", r"bunk", r"haziri", r"shortage",
        r"classes\s+missed", r"percentage", r"detain", r"below\s+75"
    ]),
    ("courses", "📚 Courses", [
        r"course", r"subject", r"syllabus", r"branch", r"elective", r"b\.?tech",
        r"mca", r"mba", r"bca", r"padhai", r"curriculum"
    ]),
    ("admission", "📝 Admission", [
        r"admission", r"apply", r"dakhila", r"seat", r"eligibility", r"form",
        r"entrance", r"cut\s*off", r"jee"
    ]),
    ("scholarship", "🎓 Scholarship", [
        r"scholarship", r"waiver", r"financial\s+aid", r"chhatravriti", r"nsp",
        r"merit", r"free-ship"
    ]),
    ("hostel", "🏠 Hostel", [
        r"hostel", r"mess", r"room", r"warden", r"curfew", r"stay", r"food",
        r"rehta", r"khana"
    ]),
    ("library", "📖 Library", [
        r"library", r"book", r"issue", r"return", r"pustakalaya", r"reading\s+room",
        r"ieee", r"journal"
    ]),
    ("placement", "💼 Placement", [
        r"placement", r"job", r"company", r"package", r"salary", r"lpa", r"recruiter",
        r"tpc", r"interview", r"naukri"
    ]),
    ("notices", "📢 Notices", [
        r"notice", r"announcement", r"circular", r"update", r"news", r"khabar"
    ]),
    ("timetable", "⏰ Timetable", [
        r"timetable", r"time\s+table", r"routine", r"class\s+timing", r"period"
    ]),
    ("assignments", "📝 Assignments", [
        r"assignment", r"project", r"homework", r"submission", r"task", r"due\s+date"
    ]),
    ("support", "🎧 Support Ticket", [
        r"ticket", r"support", r"complaint", r"grievance", r"issue", r"problem",
        r"helpdesk", r"remedy", r"help\s+me"
    ])
]

SENTIMENT_PATTERNS = [
    ("Stressed", "😟 Stressed", [
        r"stress", r"worried", r"tension", r"nervous", r"scared", r"fear", r"panic",
        r"pressure", r"darr", r"pareshaan", r"fail", r"overwhelmed"
    ]),
    ("Frustrated", "😠 Frustrated", [
        r"angry", r"annoyed", r"frustrated", r"worst", r"useless", r"bad", r"terrible",
        r"bakwas", r"gussa", r"stupid", r"waste", r"horrible"
    ]),
    ("Confused", "😕 Confused", [
        r"confused", r"don'?t\s+understand", r"unclear", r"lost", r"doubt",
        r"samajh\s+nahi", r"samajhna", r"samajh\s+ni", r"pata\s+nahi"
    ]),
    ("Happy", "😊 Happy", [
        r"happy", r"great", r"awesome", r"good", r"thanks", r"thank\s+you", r"excellent",
        r"excited", r"badhiya", r"accha", r"dhanyawad", r"perfect", r"love"
    ])
]


def detect_intent(text):
    text_lower = text.lower()
    for code, label, patterns in INTENT_PATTERNS:
        for pat in patterns:
            if re.search(pat, text_lower):
                return code, label
    return "general_question", "💬 General Query"


def detect_sentiment(text):
    text_lower = text.lower()
    for code, label, patterns in SENTIMENT_PATTERNS:
        for pat in patterns:
            if re.search(pat, text_lower):
                return code, label
    return "Neutral", "🙂 Neutral"
