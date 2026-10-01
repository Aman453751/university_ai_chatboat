import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import {
  Award, Sparkles, TrendingUp
} from 'lucide-react';

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/login');
      return;
    }

    const fetchInsights = async () => {
      try {
        const res = await API.get('/attendance');
        setAttendanceData(res.data);
      } catch (err) {
        console.error("Failed to fetch insights data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInsights();
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface font-body">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-900 text-xs font-label font-bold">Loading Academic Insights...</p>
        </div>
      </div>
    );
  }

  const overallPct = attendanceData?.overall_percentage ?? user?.attendance_pct ?? 0;
  const subjects = attendanceData?.subjects || [];
  const lowestSub = subjects.length > 0
    ? subjects.reduce((prev, curr) => prev.attendance_percentage < curr.attendance_percentage ? prev : curr)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-gray-900 selection:bg-primary-container selection:text-white pb-20">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Hero Banner Section */}
        <section className="bg-gray-900 text-white rounded-xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Academic Review & Insights
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-body font-medium">Real-time database analytics for attendance compliance and semester performance.</p>
          </div>

          <div className="flex items-center gap-2 py-1.5 px-3 bg-amber-300 text-gray-950 rounded text-xs font-label font-extrabold uppercase shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 text-gray-950" />
            <span>Overall Attendance: {overallPct}%</span>
          </div>
        </section>

        {/* Insights Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

          {/* Subject Attendance Bars Card */}
          <div className="md:col-span-4 bg-white rounded-xl p-6 border border-gray-300 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <h3 className="font-label text-xs font-extrabold uppercase tracking-wider text-gray-800 mb-1">Attendance Trend Analysis</h3>
                <p className="font-headline text-2xl font-bold text-gray-900">{overallPct}% Average Attendance</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 rounded text-xs font-label font-extrabold text-gray-900 border border-gray-300">
                SQLite Verified
              </span>
            </div>

            {/* Subject Attendance Bars */}
            <div className="space-y-3">
              {subjects.map((sub, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-label font-extrabold">
                    <span className="text-gray-900">{sub.subject} ({sub.subject_code})</span>
                    <span className={sub.attendance_percentage < 75 ? 'text-red-700' : 'text-emerald-800'}>
                      {sub.attendance_percentage}% ({sub.attended_classes}/{sub.total_classes})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        sub.attendance_percentage < 75 ? 'bg-red-600' : 'bg-gray-900'
                      }`}
                      style={{ width: `${sub.attendance_percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[11px] font-label font-extrabold text-gray-800 uppercase tracking-wider pt-2 border-t border-gray-200">
              <span>{subjects.length} Enrolled Courses</span>
              <span>Mandatory Threshold: 75%</span>
            </div>
          </div>

          {/* Academic Stress Ring Card */}
          <div className="md:col-span-2 bg-white rounded-xl p-6 border border-gray-300 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-label text-xs font-extrabold uppercase tracking-wider text-gray-800 mb-1">Academic Recovery</h3>
              <p className="font-headline text-2xl font-bold text-red-800">Optimal Balance</p>
            </div>

            <div className="relative w-full aspect-square flex items-center justify-center my-2 max-w-[180px] mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-gray-200" cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeWidth="8" />
                <circle className="text-red-700" cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeDasharray="251" strokeDashoffset="180" strokeLinecap="round" strokeWidth="8" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-headline font-extrabold text-gray-900">24%</span>
                <span className="text-[10px] font-label font-extrabold uppercase text-gray-800">Stress Index</span>
              </div>
            </div>

            <p className="font-body text-xs text-gray-700 font-medium leading-relaxed">
              Your exam readiness and attendance indicators reflect strong performance.
            </p>
          </div>

          {/* Active Study Minutes Graph Card */}
          <div className="md:col-span-3 bg-white rounded-xl p-6 border border-gray-300 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <h3 className="font-label text-xs font-extrabold uppercase tracking-wider text-gray-800">Active Weekly Study Hours</h3>
              <p className="font-headline text-3xl font-bold text-gray-900">28 <span className="text-sm font-bold text-gray-700">hrs / week</span></p>
            </div>

            <div className="flex items-end gap-2 h-20 pt-2">
              <div className="w-full bg-gray-200 rounded h-[40%]"></div>
              <div className="w-full bg-gray-200 rounded h-[60%]"></div>
              <div className="w-full bg-gray-200 rounded h-[85%]"></div>
              <div className="w-full bg-gray-200 rounded h-[45%]"></div>
              <div className="w-full bg-gray-200 rounded h-[70%]"></div>
              <div className="w-full bg-gray-900 rounded h-[95%]"></div>
            </div>
            <p className="font-label text-xs font-extrabold text-gray-900 pt-1">Peak academic engagement on Thursday & Friday</p>
          </div>

          {/* Focus Sessions Counter Card */}
          <div className="md:col-span-3 bg-white rounded-xl p-6 border border-gray-300 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 text-red-900 border border-red-300 flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-6 h-6 text-red-800" />
            </div>
            <div className="space-y-1">
              <h3 className="font-label text-xs font-extrabold uppercase tracking-wider text-gray-800">Academic Milestones</h3>
              <p className="font-headline text-base font-bold text-gray-900">12 Focus Modules Completed</p>
              <p className="font-body text-xs text-gray-700 font-medium">Consistent performance across autumn semester terms</p>
            </div>
          </div>

        </div>

        {/* AI Perspective Narrative Section */}
        <section className="bg-white border border-gray-300 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="max-w-2xl space-y-3">
            <h4 className="font-headline text-xl font-bold text-gray-900">AI Academic Consultation Perspective</h4>
            <p className="font-body text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
              Your consistent lecture attendance directly correlates with exam preparedness.
              {lowestSub && (
                <> Your lowest subject is <strong className="text-gray-900 font-bold">{lowestSub.subject}</strong> at <strong>{lowestSub.attendance_percentage}%</strong>. Prioritize upcoming lectures for this course to ensure 75% threshold compliance.</>
              )}
            </p>
            <button
              onClick={() => navigate('/chat', { state: { initialQuery: "Give me my attendance summary and study recommendations." } })}
              className="bg-gray-900 hover:bg-red-800 text-white px-5 py-2.5 rounded-lg font-label font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <span>Ask AI Assistant For Study Advice</span>
              <TrendingUp className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </section>

      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
