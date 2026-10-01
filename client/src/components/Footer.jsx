import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Heart, Sparkles, Globe, ExternalLink,
  Twitter, Facebook, Linkedin, Youtube, Instagram
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#030712] text-slate-100 border-t border-gray-800 overflow-hidden font-body min-h-[420px]">
      {/* 1. LOWEST LAYER (z-0): Single ABES Campus Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{ backgroundImage: `url('/images/abes_campus.png')` }}
      />

      {/* 2. MIDDLE LAYER (z-1): Single Dark Navy Overlay (50% Opacity) */}
      <div className="absolute inset-0 bg-[#050c1c]/50 bg-gradient-to-b from-[#030712]/60 via-[#050c1c]/50 to-[#030712]/70 pointer-events-none z-1" />

      {/* 3. HIGHEST LAYER (z-2): Footer Content */}
      <div className="relative z-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-10 sm:pb-14 space-y-10">
        
        {/* Top Header Glass Banner */}
        <div className="bg-[#050c1c]/75 p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <img src="/images/abes_logo.png" alt="ABES Engineering College Logo" className="h-12 sm:h-14 w-auto object-contain" />
            </Link>
            <div className="hidden md:block pl-4 border-l border-white/20">
              <span className="text-amber-400 font-label text-xs font-extrabold uppercase tracking-wider block">ABES Engineering College</span>
              <span className="text-slate-200 font-body text-[11px] font-medium">19th KM Stone, NH-09, Ghaziabad • Autonomous • AKTU Code: 032</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-label font-extrabold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Launch AI Assistant Support</span>
            </Link>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Card 1: About & Social Media */}
          <div className="bg-[#050c1c]/75 p-6 rounded-2xl border border-white/10 space-y-4 hover:border-amber-400/30 transition-all shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-label text-xs font-extrabold text-amber-400 uppercase tracking-wider">About ABES Portal</h3>
              <p className="text-xs leading-relaxed text-slate-200 font-body font-medium">
                Empowering student excellence with verified academic AI intelligence, admissions guidance, semester exam timetables, fee portals, placement insights, and 24/7 campus helplines.
              </p>
            </div>

            {/* Social Media Links */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-label font-bold text-amber-300 uppercase tracking-wider block">Connect With Us</span>
              <div className="flex items-center gap-2.5">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" title="Twitter / X" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" title="YouTube" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Navigation Links */}
          <div className="bg-[#050c1c]/75 p-6 rounded-2xl border border-white/10 space-y-4 hover:border-amber-400/30 transition-all shadow-lg">
            <h3 className="font-label text-xs font-extrabold text-amber-400 uppercase tracking-wider">Quick Navigation</h3>
            <ul className="space-y-2.5 text-xs font-label font-medium text-slate-200">
              <li>
                <Link to="/" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span> Home Portal
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span> AI Assistant Chat
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span> Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/insights" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span> Analytics & Insights
                </Link>
              </li>
              <li>
                <Link to="/about-abes" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 font-bold text-amber-300">
                  <span className="text-amber-400 font-bold">›</span> About ABES Engineering College
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span> Knowledge Base FAQs
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">›</span> Student & Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 3: Student Services / Institutional Portals */}
          <div className="bg-[#050c1c]/75 p-6 rounded-2xl border border-white/10 space-y-4 hover:border-amber-400/30 transition-all shadow-lg">
            <h3 className="font-label text-xs font-extrabold text-amber-400 uppercase tracking-wider">Student Services</h3>
            <ul className="space-y-2.5 text-xs font-label font-medium text-slate-200">
              <li className="hover:text-white transition-colors cursor-default flex items-center gap-1.5">
                <span className="text-amber-400">▪</span> Admissions & AKTU Counseling
              </li>
              <li className="hover:text-white transition-colors cursor-default flex items-center gap-1.5">
                <span className="text-amber-400">▪</span> Exam Timetable & Roll No. Forms
              </li>
              <li className="hover:text-white transition-colors cursor-default flex items-center gap-1.5">
                <span className="text-amber-400">▪</span> Tuition & Hostel Fee Payments
              </li>
              <li className="hover:text-white transition-colors cursor-default flex items-center gap-1.5">
                <span className="text-amber-400">▪</span> Central Library 24/7 Portal
              </li>
              <li className="hover:text-white transition-colors cursor-default flex items-center gap-1.5">
                <span className="text-amber-400">▪</span> Training & Placement Cell (CRT)
              </li>
              <li className="hover:text-white transition-colors cursor-default flex items-center gap-1.5">
                <span className="text-amber-400">▪</span> Anti-Ragging & Campus Safety
              </li>
            </ul>
          </div>

          {/* Card 4: Official Helplines & Contact Info */}
          <div className="bg-[#050c1c]/75 p-6 rounded-2xl border border-white/10 space-y-4 hover:border-amber-400/30 transition-all shadow-lg">
            <h3 className="font-label text-xs font-extrabold text-amber-400 uppercase tracking-wider">Official Helplines</h3>
            <ul className="space-y-3.5 text-xs font-label font-medium text-slate-200">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-100 font-medium">19th KM Stone, NH-09 (NH-24), Ghaziabad, UP - 201009, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:01207135112" className="hover:text-amber-300 text-white font-bold transition-colors">0120-7135112</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:info@abes.ac.in" className="hover:text-amber-300 text-white font-bold transition-colors">info@abes.ac.in</a>
              </li>
              <li className="pt-1">
                <a
                  href="https://www.abes.ac.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>https://www.abes.ac.in/</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal Policy Links */}
        <div className="bg-[#050c1c]/80 px-6 py-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-label text-slate-300 font-medium gap-4">
          <p>© {new Date().getFullYear()} ABES Engineering College / ABES University. All rights reserved.</p>
          
          <div className="flex items-center gap-4 text-slate-300 text-[11px] flex-wrap justify-center">
            <span className="hover:text-amber-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-amber-300 cursor-pointer transition-colors">Terms of Use</span>
            <span>•</span>
            <span className="hover:text-amber-300 cursor-pointer transition-colors">Accessibility</span>
            <span>•</span>
            <div className="flex items-center gap-1 text-slate-200 font-semibold">
              <span>Sanctuary</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500 ml-0.5" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
