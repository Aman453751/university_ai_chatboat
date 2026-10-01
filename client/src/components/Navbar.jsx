import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { GraduationCap, MessageSquare, LayoutDashboard, HelpCircle, ShieldAlert, LogOut, Menu, X, Users, BarChart3, Settings, Info, Bell, CheckCheck, Trash2 } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications State
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMarkRead = async () => {
    try {
      await API.put('/notifications/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await API.delete('/notifications/clear');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-gray-200 shadow-sm pt-safe">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img 
            src="/images/abes_logo.png" 
            alt="ABES Engineering College" 
            className="h-10 w-auto object-contain hidden sm:block transition-transform group-hover:scale-105" 
          />
          <img 
            src="/images/abes_logo_icon.png" 
            alt="ABES EC" 
            className="h-9 w-9 object-contain block sm:hidden rounded-lg shadow-xs transition-transform group-hover:scale-105" 
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
              <span className="font-label text-[10px] text-gray-700 font-extrabold uppercase tracking-wider truncate">AI Student Portal</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-gray-100/90 p-1.5 rounded-xl border border-gray-200">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all ${
              isActive('/') ? 'bg-primary-container text-white shadow-sm' : 'text-gray-900 hover:text-black hover:bg-white'
            }`}
          >
            Home
          </Link>

          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/dashboard') ? 'bg-primary-container text-white shadow-sm' : 'text-gray-900 hover:text-black hover:bg-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>

          <Link
            to="/insights"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/insights') ? 'bg-primary-container text-white shadow-sm' : 'text-gray-900 hover:text-black hover:bg-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Insights
          </Link>

          <Link
            to="/community"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/community') ? 'bg-primary-container text-white shadow-sm' : 'text-gray-900 hover:text-black hover:bg-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Community
          </Link>

          <Link
            to="/chat"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/chat') ? 'bg-primary-container text-white shadow-sm' : 'text-gray-900 hover:text-black hover:bg-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Assistant
          </Link>

          <Link
            to="/about-abes"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/about-abes') ? 'bg-primary-container text-white shadow-sm' : 'text-gray-900 hover:text-black hover:bg-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            About ABES
          </Link>

          <Link
            to="/settings"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/settings') ? 'bg-primary-container text-white shadow-sm' : 'text-gray-900 hover:text-black hover:bg-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>

          <Link
            to="/faqs"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/faqs') ? 'bg-primary-container text-white shadow-sm' : 'text-gray-900 hover:text-black hover:bg-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            FAQs
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
                isActive('/admin') ? 'bg-red-800 text-white shadow-sm' : 'text-red-800 font-bold hover:bg-red-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* User Auth CTA & Notification Bell */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-300 relative">
              {/* Notification Bell Dropdown Button */}
              <button
                onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); if (!notifDropdownOpen && unreadCount > 0) handleMarkRead(); }}
                className="relative p-2 text-gray-800 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors"
                title="System Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-700 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {notifDropdownOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-300 rounded-xl shadow-lg z-50 overflow-hidden font-body text-xs">
                  <div className="p-3 bg-gray-900 text-white flex items-center justify-between font-label font-bold">
                    <span className="flex items-center gap-1.5 text-xs text-amber-300">
                      <Bell className="w-4 h-4 text-amber-300" /> System Notifications
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={handleMarkRead} title="Mark read" className="text-gray-300 hover:text-white">
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={handleClearNotifications} title="Clear all" className="text-gray-300 hover:text-white">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-200">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-gray-700 font-bold">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => { setNotifDropdownOpen(false); navigate(n.link || '/dashboard'); }}
                          className={`p-3 hover:bg-gray-50 cursor-pointer space-y-0.5 transition-colors ${n.is_read ? 'opacity-70' : 'bg-red-50/50'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-label font-extrabold text-[10px] text-red-800 uppercase">{n.category}</span>
                            <span className="text-[9px] text-gray-500 font-bold">{n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                          <h4 className="font-headline font-bold text-gray-900 text-xs">{n.title}</h4>
                          <p className="font-body text-xs text-gray-800 leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="text-right">
                <p className="text-xs font-label font-extrabold text-gray-900 leading-tight">{user.name}</p>
                <p className="text-[11px] text-red-800 font-mono font-bold">{user.student_id}</p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-label font-bold text-gray-900 hover:text-red-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-label font-bold bg-gray-900 hover:bg-red-800 text-white rounded-lg shadow-sm transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-2 w-full shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-gray-100"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-gray-100 flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-900" />
            Dashboard
          </Link>
          <Link
            to="/insights"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-gray-100 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-gray-900" />
            Insights & Analytics
          </Link>
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-gray-100 flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-gray-900" />
            Student Community
          </Link>
          <Link
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-gray-100 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-gray-900" />
            AI Assistant
          </Link>
          <Link
            to="/about-abes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-gray-100 flex items-center gap-2"
          >
            <Info className="w-4 h-4 text-gray-900" />
            About ABES Engineering College
          </Link>
          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-gray-100 flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-gray-900" />
            Settings
          </Link>
          <Link
            to="/faqs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-gray-100 flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-gray-900" />
            FAQs
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-red-800 hover:bg-red-50 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Portal
            </Link>
          )}

          <div className="pt-3 border-t border-gray-200">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="text-xs font-extrabold text-gray-900">{user.name}</p>
                  <p className="text-[11px] font-bold text-red-800">{user.email}</p>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 text-xs font-label font-bold bg-red-100 text-red-900 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-gray-300 text-gray-900 rounded-lg text-xs font-label font-bold"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-label font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
