import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Building2, GraduationCap, MapPin, Globe, ExternalLink, ShieldCheck, Award, BookOpen, Users, Cpu, Layers } from 'lucide-react';

export default function ABESInfoPage() {
  const btechPrograms = [
    "Computer Science & Engineering",
    "Computer Science & Engineering (Artificial Intelligence & Machine Learning)",
    "Computer Science & Engineering (Data Science)",
    "Electronics & Communication Engineering",
    "Electrical and Computer Engineering",
    "Mechanical Engineering",
    "Computer Science and Engineering (Working Professional)",
    "Electronics and Communication Engineering (Working Professional)"
  ];

  const otherPrograms = [
    { title: "BCA", desc: "Bachelor of Computer Applications" },
    { title: "MCA", desc: "Master of Computer Applications" },
    { title: "M.Tech", desc: "Master of Technology" }
  ];

  const facilities = [
    {
      title: "Smart Classrooms & Infrastructure",
      desc: "Technology-enabled learning environments equipped with audio-visual equipment and modern lecture theaters.",
      icon: Building2
    },
    {
      title: "Central Library & Digital Resources",
      desc: "Comprehensive collection of books, national/international e-journals, digital reading rooms, and IEEE Xplore access.",
      icon: BookOpen
    },
    {
      title: "Advanced Engineering Laboratories",
      desc: "Specialized laboratories for AI/ML, Data Science, VLSI, Robotics, Software Engineering, and Mechanical Systems.",
      icon: Cpu
    },
    {
      title: "On-Campus Student Hostels",
      desc: "Separate residential hostels for male and female students with 24/7 security, Wi-Fi connectivity, and dining mess.",
      icon: Users
    },
    {
      title: "Training & Placement Cell (TPC)",
      desc: "Dedicated cell conducting skill development programs, aptitude sessions, mock interviews, and corporate campus recruitment.",
      icon: Award
    },
    {
      title: "Research, Incubation & Clubs",
      desc: "Fostering student innovation through incubation support, hackathons, technical societies, cultural activities, and sports.",
      icon: Layers
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-gray-900 selection:bg-primary-container selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero Banner with background_campus.jpeg */}
        <section className="relative w-full rounded-2xl overflow-hidden shadow-xl p-6 sm:p-10 space-y-6 border border-white/10">
          {/* 1. LOWEST LAYER (z-0): background_campus.jpeg */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 scale-102 transition-transform duration-700"
            style={{ backgroundImage: `url('/images/background_campus.jpeg')` }}
          />

          {/* 2. MIDDLE LAYER (z-1): Dark Navy Overlay (48% Opacity) */}
          <div className="absolute inset-0 bg-[#050c1c]/48 bg-gradient-to-b from-[#030712]/60 via-[#050c1c]/48 to-[#030712]/65 pointer-events-none z-1" />

          {/* 3. HIGHEST LAYER (z-10): College Header & Info Cards */}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/20">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-label font-extrabold bg-amber-300 text-gray-950 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Autonomous College (Since 2025)
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-label font-bold bg-slate-950/60 text-white border border-white/20 backdrop-blur-sm">
                  Established 2000
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-headline font-extrabold text-white tracking-tight drop-shadow-md">
                ABES Engineering College
              </h1>

              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed drop-shadow-xs">
                Ghaziabad, Uttar Pradesh • AICTE Approved • AKTU Autonomous Institution
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="https://www.abes.ac.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-red-800 hover:bg-red-700 text-white font-label font-extrabold rounded-xl shadow-md text-xs flex items-center gap-2 transition-all hover:scale-105"
              >
                <Globe className="w-4 h-4 text-amber-300" />
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href="https://maps.google.com/?q=ABES+Engineering+College+Ghaziabad"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-slate-950/60 hover:bg-slate-900/80 text-white font-label font-bold rounded-xl border border-white/25 text-xs flex items-center gap-2 transition-all backdrop-blur-sm hover:border-amber-300/50"
              >
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Quick Info Cards Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-label">
            <div className="p-3.5 bg-slate-950/65 rounded-xl border border-white/20 space-y-1 backdrop-blur-sm shadow-sm">
              <span className="text-slate-300 font-extrabold block uppercase text-[10px]">Campus Location</span>
              <span className="font-bold text-white block truncate">19th KM Stone, NH-09, Ghaziabad</span>
            </div>
            <div className="p-3.5 bg-slate-950/65 rounded-xl border border-white/20 space-y-1 backdrop-blur-sm shadow-sm">
              <span className="text-slate-300 font-extrabold block uppercase text-[10px]">Official Helpline</span>
              <span className="font-mono font-extrabold text-amber-300 block truncate">0120-7135112</span>
            </div>
            <div className="p-3.5 bg-slate-950/65 rounded-xl border border-white/20 space-y-1 backdrop-blur-sm shadow-sm">
              <span className="text-slate-300 font-extrabold block uppercase text-[10px]">Contact Email</span>
              <span className="font-bold text-white block truncate">info@abes.ac.in</span>
            </div>
            <div className="p-3.5 bg-slate-950/65 rounded-xl border border-white/20 space-y-1 backdrop-blur-sm shadow-sm">
              <span className="text-slate-300 font-extrabold block uppercase text-[10px]">Official Web URL</span>
              <a href="https://www.abes.ac.in/" target="_blank" rel="noopener noreferrer" className="font-extrabold text-amber-300 underline truncate block">
                https://www.abes.ac.in/
              </a>
            </div>
          </div>
        </section>

        {/* About ABES Factual Summary */}
        <section className="bg-white border border-gray-300 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-headline font-bold text-xl border-b border-gray-200 pb-3">
            <Building2 className="w-5 h-5 text-red-800" />
            <h2>About ABES Engineering College</h2>
          </div>

          <div className="prose prose-sm max-w-none text-gray-900 font-body font-medium space-y-3 text-xs sm:text-sm leading-relaxed">
            <p className="text-gray-900 font-medium">
              ABES Engineering College (College Code: 032) is a premier engineering institution situated in Ghaziabad, Delhi-NCR, Uttar Pradesh. Established in the year 2000 under the aegis of Society for Educational Advancement, the college has developed into an autonomous educational powerhouse offering high-quality technical education.
            </p>
            <p className="text-gray-900 font-medium">
              Approved by the All India Council for Technical Education (AICTE), New Delhi, and affiliated with Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow, ABES Engineering College holds Autonomous Status granted by UGC and AKTU starting from the 2025 academic batch.
            </p>
          </div>
        </section>

        {/* Academic Programs Section */}
        <section className="bg-white border border-gray-300 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2 text-gray-900 font-headline font-bold text-xl">
              <GraduationCap className="w-5 h-5 text-red-800" />
              <h2>Academic Programs & Courses Offered</h2>
            </div>
            <span className="font-label text-xs font-bold text-red-900 uppercase bg-red-100 border border-red-300 px-2.5 py-1 rounded">
              AICTE Approved
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="font-label text-xs font-extrabold uppercase tracking-wider text-gray-800">
              Bachelor of Technology (B.Tech) Specializations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {btechPrograms.map((prog, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50 rounded-lg border border-gray-300 font-headline font-bold text-xs text-gray-900 flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-800 shrink-0"></span>
                  <span>{prog}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-label text-xs font-extrabold uppercase tracking-wider text-gray-800">
              Postgraduate & Professional Programs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {otherPrograms.map((prog, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-300 space-y-1">
                  <h4 className="font-headline font-bold text-red-800 text-sm">{prog.title}</h4>
                  <p className="font-body text-xs text-gray-700 font-medium">{prog.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Placement Record Matrix */}
        <section className="bg-white border border-gray-300 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2 text-gray-900 font-headline font-bold text-xl">
              <Award className="w-5 h-5 text-amber-700" />
              <h2>Training & Placement Highlights (2024 Batch)</h2>
            </div>
            <span className="font-label text-xs font-extrabold text-emerald-950 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded uppercase">
              Verified Statistics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 flex flex-col justify-between">
              <span className="font-label text-xs text-gray-800 uppercase font-extrabold">Highest Salary Package</span>
              <span className="font-headline text-3xl font-extrabold text-red-800 mt-1">₹50 LPA</span>
              <span className="font-label text-xs text-gray-700 font-bold mt-1">Offered by Microsoft & Amazon</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 flex flex-col justify-between">
              <span className="font-label text-xs text-gray-800 uppercase font-extrabold">Average CSE CTC</span>
              <span className="font-headline text-3xl font-extrabold text-gray-900 mt-1">₹7.2 LPA</span>
              <span className="font-label text-xs text-gray-700 font-bold mt-1">Consistent YoY Placement Growth</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 flex flex-col justify-between">
              <span className="font-label text-xs text-gray-800 uppercase font-extrabold">Visiting Corporate Recruiters</span>
              <span className="font-headline text-3xl font-extrabold text-amber-700 mt-1">300+</span>
              <span className="font-label text-xs text-gray-700 font-bold mt-1">Marquee Tier-1 Corporate Partners</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 space-y-2">
            <h4 className="font-label text-xs font-extrabold text-gray-900 uppercase tracking-wider">Top Recruiter Footprint</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Amazon', 'Microsoft', 'Cognizant', 'TCS Digital', 'Wipro Turbo', 'Infosys HackWithInfy', 'Capgemini', 'HCL Technologies', 'Tech Mahindra', 'Virtusa'].map((company, idx) => (
                <span key={idx} className="bg-white px-3 py-1 rounded font-body text-xs text-gray-900 border border-gray-300 shadow-xs font-bold">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Campus Facilities Grid */}
        <section className="bg-white border border-gray-300 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-gray-900 font-headline font-bold text-xl border-b border-gray-200 pb-3">
            <Building2 className="w-5 h-5 text-red-800" />
            <h2>Campus Infrastructure & Facilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-300 flex gap-3 items-start">
                  <div className="w-9 h-9 rounded bg-gray-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-headline font-bold text-gray-900 text-sm">{fac.title}</h4>
                    <p className="font-body text-xs text-gray-700 font-medium leading-relaxed">{fac.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Official Website Redirection Callout */}
        <section className="bg-gray-900 text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-headline text-xl font-bold text-white">For Official Admissions & Notices</h3>
            <p className="font-body text-xs text-slate-200 font-medium">
              Visit the official ABES website to download syllabus brochures, fee payment links, and statutory declarations.
            </p>
          </div>

          <a
            href="https://www.abes.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white font-label font-extrabold rounded-lg text-xs shadow-sm flex items-center gap-2 transition-all shrink-0"
          >
            <span>Visit official ABES website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </section>

      </main>

      <Footer />
    </div>
  );
}
