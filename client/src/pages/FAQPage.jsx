import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HelpCircle, Search, MessageSquare, ArrowRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function FAQPage() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const categories = [
    "All", "Admissions", "Academics", "Examinations", "Results", "Attendance", "Fees", "Scholarships", "Hostel", "Library", "Placements", "Rules & Regulations"
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await API.get('/faqs');
      setFaqs(res.data.faqs || []);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAskChatbot = (question) => {
    navigate('/chat', { state: { initialQuery: question } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-gray-900 selection:bg-primary-container selection:text-white pb-20">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded text-xs font-label font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Verified Knowledge Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-headline font-bold text-gray-900 tracking-tight">
            Frequently Asked <span className="text-red-800">Questions</span>
          </h1>

          <p className="text-gray-700 font-body text-xs sm:text-sm font-medium leading-relaxed">
            Browse verified academic knowledge articles or click any question to open the ABES AI Assistant for instant consultation!
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto pt-2">
            <Search className="w-4 h-4 text-gray-600 absolute left-4 top-1/2 -translate-y-1/2 mt-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs by topic (e.g. fees, hostel, exam schedule)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-xs font-body text-gray-900 font-medium shadow-xs focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 transition-all placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-label font-extrabold transition-all ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs Accordion Grid */}
        {loading ? (
          <div className="py-12 text-center text-gray-900 text-xs font-label font-bold uppercase tracking-wider">
            <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading Knowledge Base...
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-900 border border-gray-300 space-y-3">
            <HelpCircle className="w-10 h-10 mx-auto text-gray-500" />
            <p className="font-headline font-bold text-gray-900 text-base">No matching FAQs found.</p>
            <p className="text-xs text-gray-700 font-medium font-body">Try searching for another topic or ask the AI Assistant directly!</p>
            <button
              onClick={() => handleAskChatbot(searchQuery || "Help")}
              className="px-5 py-2 bg-gray-900 text-white font-label font-bold rounded-lg text-xs shadow-xs"
            >
              Ask AI Assistant
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-900 border border-gray-300 font-label font-extrabold text-[10px] uppercase rounded shrink-0">
                        {faq.category}
                      </span>
                      <h3 className="font-headline font-bold text-gray-900 text-sm sm:text-base">
                        {faq.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAskChatbot(faq.question); }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gray-900 hover:bg-red-800 text-white rounded text-xs font-label font-bold transition-all shadow-xs"
                        title="Ask this question in Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ask AI</span>
                      </button>

                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-700" /> : <ChevronDown className="w-4 h-4 text-gray-700" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-200 text-gray-900 font-body font-medium text-xs sm:text-sm leading-relaxed bg-gray-50 space-y-3">
                      <p className="pt-3 text-gray-900 font-medium">{faq.answer}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-300 text-xs font-label">
                        <span className="text-gray-800 font-bold">Need specific course or fee details?</span>
                        <button
                          onClick={() => handleAskChatbot(faq.question)}
                          className="font-extrabold text-red-800 hover:underline flex items-center gap-1"
                        >
                          Ask AI Assistant
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
