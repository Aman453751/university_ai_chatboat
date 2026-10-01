import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, ShieldCheck, Clock, CheckCircle2, Building2, GraduationCap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleQuickPrompt = (promptText) => {
    navigate('/chat', { state: { initialPrompt: promptText } });
  };

  const portals = [
    {
      icon: "how_to_reg",
      title: "Admissions & Cutoffs",
      description: "JEE Main cutoffs, AKTU CUET counseling guidelines, fee waivers, direct admissions, & eligibility rules.",
      color: "text-red-800",
      bgIcon: "account_balance_wallet",
      cta: "Check Status",
      path: "/chat"
    },
    {
      icon: "library_books",
      title: "Academics & Syllabus",
      description: "Autonomous curriculum schemes, subject lecture notes, internal assessment criteria, and 75% attendance rules.",
      color: "text-amber-800",
      bgIcon: "auto_stories",
      cta: "View Syllabus",
      path: "/chat"
    },
    {
      icon: "work_history",
      title: "Career & Placements",
      description: "Campus Recruitment Training (CRT), highest ₹50 LPA package stats, 300+ recruiters, and placement NOC.",
      color: "text-red-800",
      bgIcon: "workspace_premium",
      cta: "Placement Hub",
      path: "/chat"
    },
    {
      icon: "groups",
      title: "Campus Life & Facilities",
      description: "Hostel allotments, mess menu, 24/7 central library, bus routes, Genera fest, coding syndicates & sports.",
      color: "text-gray-900",
      bgIcon: "sports_soccer",
      cta: "Explore Facilities",
      path: "/about-abes"
    }
  ];

  const samplePrompts = [
    "B.Tech Admissions & Fee",
    "Hostel Fee Schedule & Mess",
    "Exam Timetable AKTU",
    "Highest Placement CTC 2024",
    "Bus Route & Timings"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface text-gray-900 font-body selection:bg-primary-container selection:text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Notice Marquee Ticker Strip */}
        <div className="w-full bg-red-900 text-white rounded-lg px-4 py-2.5 shadow-sm flex items-center gap-3 overflow-hidden">
          <span className="material-symbols-outlined text-[20px] shrink-0 text-amber-300">campaign</span>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-marquee font-label text-xs font-bold tracking-wide text-white">
              AKTU Semester Examination Form Deadline: Nov 15 • Smart India Hackathon internal screening begins tomorrow at B-Block Lab 4 • Direct Admission Counseling Phase 2 open now at ABES Engineering College!
            </div>
          </div>
          <span className="font-label text-[11px] font-extrabold text-gray-900 uppercase tracking-wider shrink-0 bg-amber-300 px-2 py-0.5 rounded">
            Urgent Notice
          </span>
        </div>

        {/* Campus Hero Section with background_campus.jpeg */}
        <section className="relative w-full rounded-2xl overflow-hidden shadow-xl min-h-[420px] p-6 sm:p-10 flex flex-col justify-between gap-8 border border-white/10">
          {/* 1. LOWEST LAYER (z-0): background_campus.jpeg */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 scale-102 transition-transform duration-700"
            style={{ backgroundImage: `url('/images/background_campus.jpeg')` }}
          />

          {/* 2. MIDDLE LAYER (z-1): Dark Navy Overlay (48% Opacity) */}
          <div className="absolute inset-0 bg-[#050c1c]/48 bg-gradient-to-b from-[#030712]/60 via-[#050c1c]/48 to-[#030712]/65 pointer-events-none z-1" />

          {/* 3. HIGHEST LAYER (z-10): Hero Content & Controls */}
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-300 text-gray-950 font-label text-xs font-extrabold tracking-wider uppercase shadow-md">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Autonomous Institution</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-label text-xs font-bold px-3 py-1 rounded-lg bg-slate-950/60 backdrop-blur-sm border border-emerald-500/30">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Admissions 2025 Live</span>
              </div>
            </div>

            <div className="mt-2 space-y-3 max-w-3xl">
              <h1 className="font-headline text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                AI-Powered Chatbot for University Student Support
              </h1>
              <p className="font-body text-sm sm:text-base text-slate-100 font-medium max-w-2xl leading-relaxed drop-shadow-sm">
                Empowering your scholarly journey at Delhi-NCR’s premier engineering ecosystem. Ask instant questions about autonomous curricula, exam forms, hostels, or placement milestones.
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar">
              <span className="text-xs font-label text-amber-300 font-bold shrink-0">Popular Prompts:</span>
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="shrink-0 bg-slate-950/60 hover:bg-slate-900/80 text-white px-3.5 py-1.5 rounded-lg font-label text-xs font-bold backdrop-blur-sm flex items-center gap-1.5 transition-all border border-white/20 hover:border-amber-300/50 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[15px] text-amber-300">auto_awesome</span>
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 border-t border-white/20">
            <Link
              to="/chat"
              className="bg-red-800 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-label text-xs font-extrabold shadow-md flex items-center gap-2 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>Launch AI Student Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/about-abes"
              className="bg-slate-950/60 hover:bg-slate-900/80 text-white px-5 py-3 rounded-xl font-label text-xs font-extrabold backdrop-blur-sm flex items-center gap-2 transition-all border border-white/30 hover:border-amber-300/50"
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Verified College Info</span>
            </Link>

            <Link
              to="/dashboard"
              className="bg-slate-950/60 hover:bg-slate-900/80 text-white px-5 py-3 rounded-xl font-label text-xs font-extrabold backdrop-blur-sm flex items-center gap-2 transition-all border border-white/30 hover:border-amber-300/50"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Student Portal Login</span>
            </Link>
          </div>
        </section>

        {/* 2x2 Grid Campus Portals */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline text-2xl font-bold text-gray-900">Campus Knowledge Portals</h2>
            <Link to="/faqs" className="font-label text-xs font-extrabold text-red-800 hover:underline flex items-center gap-1">
              <span>Explore Directory</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portals.map((portal, idx) => (
              <div
                key={idx}
                onClick={() => navigate(portal.path)}
                className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md cursor-pointer transition-all"
              >
                <div className="absolute -right-3 -bottom-3 text-gray-300 opacity-25 pointer-events-none">
                  <span className="material-symbols-outlined text-[80px]">{portal.bgIcon}</span>
                </div>
                <div>
                  <div className={`w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center ${portal.color} mb-3 border border-gray-200`}>
                    <span className="material-symbols-outlined text-[20px]">{portal.icon}</span>
                  </div>
                  <h3 className="font-title text-base font-bold text-gray-900 leading-snug">{portal.title}</h3>
                  <p className="font-body text-xs text-gray-700 font-medium mt-1.5 leading-relaxed">
                    {portal.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-red-800 font-label text-xs font-extrabold">
                  <span>{portal.cta}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Proposition Badges */}
        <section className="bg-gray-100 p-6 rounded-xl border border-gray-300 flex flex-wrap items-center justify-around gap-4 text-center">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-gray-900 text-amber-300 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-label text-xs font-extrabold text-gray-900">24/7 Verified Responses</h4>
              <p className="font-body text-[11px] text-gray-700 font-medium">Instant answers from official ABES syllabus & notices</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-gray-900 text-amber-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-label text-xs font-extrabold text-gray-900">Official Helpline Links</h4>
              <p className="font-body text-[11px] text-gray-700 font-medium">Direct link to https://www.abes.ac.in/ for official notices</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-gray-900 text-amber-300 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="font-label text-xs font-extrabold text-gray-900">Zero Wait Time</h4>
              <p className="font-body text-[11px] text-gray-700 font-medium">Instant student assistance anytime, anywhere</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
