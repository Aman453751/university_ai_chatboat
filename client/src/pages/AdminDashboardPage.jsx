import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldAlert, Users, HelpCircle, ThumbsUp, BookOpen, Plus, Trash2, Edit2, Check, X, AlertCircle, Ticket, BarChart3, MessageSquare } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'tickets' | 'kb' | 'faqs' | 'students' | 'feedback'
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [students, setStudents] = useState([]);
  const [feedbackLogs, setFeedbackLogs] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Knowledge Base Modal Form State
  const [showKbModal, setShowKbModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [kbForm, setKbForm] = useState({
    category: 'Admissions',
    title: '',
    content: '',
    keywords: '',
    department_contact: ''
  });

  // FAQ Modal Form State
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqForm, setFaqForm] = useState({
    category: 'General',
    question: '',
    answer: '',
    is_popular: true
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/login');
      return;
    }

    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, kbRes, faqsRes, studentsRes, feedbackRes, ticketsRes] = await Promise.all([
        API.get('/admin/statistics'),
        API.get('/university-info'),
        API.get('/faqs'),
        API.get('/admin/students'),
        API.get('/admin/feedback'),
        API.get('/tickets/admin/all')
      ]);

      setStats(statsRes.data);
      setArticles(kbRes.data.articles || []);
      setFaqs(faqsRes.data.faqs || []);
      setStudents(studentsRes.data.students || []);
      setFeedbackLogs(feedbackRes.data.feedback || []);
      setAllTickets(ticketsRes.data.tickets || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("Failed to fetch admin data. Make sure you are logged in with admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await API.put(`/tickets/admin/${ticketId}`, { status: newStatus });
      setMessage(`Ticket status updated to ${newStatus}`);
      loadAdminData();
    } catch (err) {
      setError("Failed to update ticket status.");
    }
  };

  // KB CRUD
  const handleSaveKb = async (e) => {
    e.preventDefault();
    if (!kbForm.title || !kbForm.content) return;

    try {
      if (editingArticle) {
        await API.put(`/university-info/${editingArticle.id}`, kbForm);
        setMessage("Article updated successfully!");
      } else {
        await API.post('/university-info', kbForm);
        setMessage("Article added successfully!");
      }
      setShowKbModal(false);
      setEditingArticle(null);
      setKbForm({ category: 'Admissions', title: '', content: '', keywords: '', department_contact: '' });
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save article.");
    }
  };

  const handleDeleteKb = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Knowledge Base article?")) return;
    try {
      await API.delete(`/university-info/${id}`);
      setMessage("Article deleted.");
      loadAdminData();
    } catch (err) {
      setError("Failed to delete article.");
    }
  };

  const openEditKb = (art) => {
    setEditingArticle(art);
    setKbForm({
      category: art.category,
      title: art.title,
      content: art.content,
      keywords: art.keywords || '',
      department_contact: art.department_contact || ''
    });
    setShowKbModal(true);
  };

  // FAQ CRUD
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer) return;

    try {
      await API.post('/faqs', faqForm);
      setMessage("FAQ added successfully!");
      setShowFaqModal(false);
      setFaqForm({ category: 'General', question: '', answer: '', is_popular: true });
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save FAQ.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface font-body">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-900 text-xs font-label font-bold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const intentsBreakdown = stats?.intents_breakdown || [];

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-gray-900 selection:bg-primary-container selection:text-white pb-20">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Hero Header */}
        <section className="bg-gray-900 text-white rounded-xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-800 text-white font-label text-[10px] font-extrabold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              Administrative Control Console
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-white tracking-tight">
              ABES Engineering College Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-body font-medium">Manage RAG Knowledge Base articles, support tickets, topic analytics, and student records.</p>
          </div>
        </section>

        {/* Status Banners */}
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-label font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              {message}
            </span>
            <button onClick={() => setMessage('')} className="text-emerald-950 font-bold">✕</button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-950 rounded-lg text-xs font-label font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700" />
              {error}
            </span>
            <button onClick={() => setError('')} className="text-red-950 font-bold">✕</button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-gray-300">
          {[
            { key: 'stats', label: 'System Overview', icon: ShieldAlert },
            { key: 'tickets', label: `Support Tickets (${allTickets.length})`, icon: Ticket },
            { key: 'kb', label: `Knowledge Base (${articles.length})`, icon: BookOpen },
            { key: 'faqs', label: `FAQs Directory (${faqs.length})`, icon: HelpCircle },
            { key: 'students', label: `Registered Students (${students.length})`, icon: Users },
            { key: 'feedback', label: `Feedback Logs (${feedbackLogs.length})`, icon: ThumbsUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-label font-bold transition-all shrink-0 border-b-2 ${
                  active
                    ? 'bg-white text-red-800 border-red-800 shadow-xs'
                    : 'text-gray-800 hover:text-black border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: System Overview Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-xs space-y-1">
                <span className="font-label text-xs text-gray-800 uppercase font-extrabold">Total Students</span>
                <p className="font-headline text-3xl font-bold text-gray-900">{stats?.total_students || students.length}</p>
                <span className="font-label text-[11px] text-emerald-800 font-extrabold">Registered Accounts</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-xs space-y-1">
                <span className="font-label text-xs text-gray-800 uppercase font-extrabold">Support Tickets</span>
                <p className="font-headline text-3xl font-bold text-purple-800">{stats?.total_tickets || allTickets.length}</p>
                <span className="font-label text-[11px] text-purple-900 font-extrabold">{stats?.open_tickets || 0} Open • {stats?.resolved_tickets || 0} Resolved</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-xs space-y-1">
                <span className="font-label text-xs text-gray-800 uppercase font-extrabold">Chat Sessions</span>
                <p className="font-headline text-3xl font-bold text-red-800">{stats?.total_conversations || 0}</p>
                <span className="font-label text-[11px] text-gray-700 font-bold">Active RAG Conversations</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-xs space-y-1">
                <span className="font-label text-xs text-gray-800 uppercase font-extrabold">Knowledge Articles</span>
                <p className="font-headline text-3xl font-bold text-gray-900">{articles.length}</p>
                <span className="font-label text-[11px] text-emerald-800 font-extrabold">Verified Knowledge Base</span>
              </div>
            </div>

            {/* Most Asked Topics / Intent Breakdown */}
            <div className="bg-white rounded-xl p-6 border border-gray-300 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="font-headline text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-red-800" />
                  Most Asked Student Topics & Detected Intents
                </h3>
                <span className="font-label text-xs font-bold text-gray-700">Calculated from Live Chat Messages</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {intentsBreakdown.map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between shadow-2xs">
                    <span className="font-headline font-bold text-xs text-gray-900">{item.topic}</span>
                    <span className="px-3 py-1 bg-red-800 text-white font-mono font-bold text-xs rounded-full">
                      {item.count} queries
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Support Tickets Management */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-bold text-gray-900">Support Ticket Management</h3>

            <div className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-900 font-label font-extrabold uppercase tracking-wider bg-gray-50">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Issue Description</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-label text-gray-900">
                  {allTickets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-gray-700 font-bold">No support tickets registered.</td>
                    </tr>
                  ) : (
                    allTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-red-800">{t.ticket_code}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{t.student_name} ({t.student_id})</td>
                        <td className="py-3 px-4 font-bold text-gray-800">{t.category}</td>
                        <td className="py-3 px-4 font-body font-medium text-gray-900 max-w-xs truncate">{t.issue}</td>
                        <td className="py-3 px-4 font-bold text-gray-800">{t.priority}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' :
                            t.status === 'In Progress' ? 'bg-amber-100 text-amber-950 border border-amber-300' :
                            'bg-purple-100 text-purple-950 border border-purple-300'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                            className="bg-white border border-gray-300 rounded px-2 py-1 font-bold text-xs text-gray-900 outline-none"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Knowledge Base Management */}
        {activeTab === 'kb' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-gray-900">Knowledge Base Articles</h3>
              <button
                onClick={() => { setEditingArticle(null); setKbForm({ category: 'Admissions', title: '', content: '', keywords: '', department_contact: '' }); setShowKbModal(true); }}
                className="px-4 py-2 bg-gray-900 text-white hover:bg-red-800 rounded-lg text-xs font-label font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add Knowledge Article</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-900 font-label font-extrabold uppercase tracking-wider bg-gray-50">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Department Contact</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-label text-gray-900">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-headline font-bold text-gray-900">{art.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-900 border border-gray-300 rounded text-[10px] font-extrabold uppercase">
                          {art.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-bold">{art.department_contact || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditKb(art)} className="p-1 text-gray-900 hover:text-red-800 font-bold" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteKb(art.id)} className="p-1 text-red-700 hover:text-red-900 font-bold" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: FAQs Management */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-gray-900">Directory FAQs</h3>
              <button
                onClick={() => setShowFaqModal(true)}
                className="px-4 py-2 bg-gray-900 text-white hover:bg-red-800 rounded-lg text-xs font-label font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add FAQ Article</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-900 font-label font-extrabold uppercase tracking-wider bg-gray-50">
                    <th className="py-3 px-4">Question</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Answer Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-label text-gray-900">
                  {faqs.map((faq) => (
                    <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-headline font-bold text-gray-900">{faq.question}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-900 border border-gray-300 rounded text-[10px] font-extrabold uppercase">
                          {faq.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium truncate max-w-xs">{faq.answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Students Roster */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-bold text-gray-900">Registered Students Roster</h3>

            <div className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-900 font-label font-extrabold uppercase tracking-wider bg-gray-50">
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-label text-gray-900">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-red-800">{stu.student_id}</td>
                      <td className="py-3 px-4 font-headline font-bold text-gray-900">{stu.name}</td>
                      <td className="py-3 px-4 text-gray-800 font-bold">{stu.email}</td>
                      <td className="py-3 px-4 font-bold">{stu.course || 'B.Tech'}</td>
                      <td className="py-3 px-4 font-bold">{stu.semester || 'Semester 1'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${stu.role === 'admin' ? 'bg-red-100 text-red-950 border border-red-300' : 'bg-gray-100 text-gray-900 border border-gray-300'}`}>
                          {stu.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: Feedback Logs */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-bold text-gray-900">Student Feedback Logs</h3>

            <div className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-900 font-label font-extrabold uppercase tracking-wider bg-gray-50">
                    <th className="py-3 px-4">Message ID</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-label text-gray-900">
                  {feedbackLogs.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-gray-700 font-bold text-xs">No feedback ratings submitted yet.</td>
                    </tr>
                  ) : (
                    feedbackLogs.map((fb, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold">{fb.message_id || idx}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${fb.rating === 'like' ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-red-100 text-red-950 border border-red-300'}`}>
                            {fb.rating}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800 font-bold">{fb.created_at ? new Date(fb.created_at).toLocaleString() : 'Recent'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* KB Modal */}
      {showKbModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 border border-gray-300 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-headline font-bold text-lg text-gray-900">
                {editingArticle ? 'Edit Knowledge Article' : 'Add Knowledge Article'}
              </h3>
              <button onClick={() => setShowKbModal(false)} className="p-1 text-gray-700 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKb} className="space-y-4">
              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={kbForm.title}
                  onChange={e => setKbForm({ ...kbForm, title: e.target.value })}
                  placeholder="Article Title..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase mb-1">Category</label>
                <select
                  value={kbForm.category}
                  onChange={e => setKbForm({ ...kbForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
                >
                  <option value="Admissions">Admissions</option>
                  <option value="Academics">Academics</option>
                  <option value="Examinations">Examinations</option>
                  <option value="Fees">Fees</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Placements">Placements</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase mb-1">Content</label>
                <textarea
                  value={kbForm.content}
                  onChange={e => setKbForm({ ...kbForm, content: e.target.value })}
                  rows={5}
                  placeholder="Article content / markdown..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKbModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-label font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-900 hover:bg-red-800 text-white rounded-lg text-xs font-label font-bold shadow-xs"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 border border-gray-300 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-headline font-bold text-lg text-gray-900">Add FAQ Article</h3>
              <button onClick={() => setShowFaqModal(false)} className="p-1 text-gray-700 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase mb-1">Question</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="Frequently Asked Question..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase mb-1">Category</label>
                <select
                  value={faqForm.category}
                  onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Admissions">Admissions</option>
                  <option value="Academics">Academics</option>
                  <option value="Examinations">Examinations</option>
                  <option value="Fees">Fees</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Placements">Placements</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase mb-1">Answer</label>
                <textarea
                  value={faqForm.answer}
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                  rows={4}
                  placeholder="Detailed answer..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-label font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-900 hover:bg-red-800 text-white rounded-lg text-xs font-label font-bold shadow-xs"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
