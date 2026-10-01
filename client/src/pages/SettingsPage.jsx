import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { showDesktopNotification } from '../services/desktopNotifications';
import {
  getNotificationPermissionState,
  subscribeUserToPush,
  unsubscribeUserFromPush
} from '../services/pushNotification';
import {
  User, Lock, Bell, Palette, LogOut, ChevronRight, Check, Sparkles,
  GraduationCap, AlertCircle, Shield, KeyRound, Monitor, Send, Clock, Ticket, Megaphone
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Update Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [section, setSection] = useState(user?.section || 'Section A');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Desktop Push Notifications State
  const [permState, setPermState] = useState(getNotificationPermissionState());
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushMsg, setPushMsg] = useState('');
  const [pushError, setPushError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setSection(user.section || 'Section A');
    }
    checkPushState();
  }, [user]);

  const checkPushState = async () => {
    const perm = getNotificationPermissionState();
    setPermState(perm);
    if (perm === 'granted' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          setIsPushSubscribed(!!sub);
        }
      } catch (e) {
        console.warn("Error checking push subscription:", e);
      }
    }
  };

  const handleTogglePush = async () => {
    setPushLoading(true);
    setPushMsg('');
    setPushError('');

    try {
      if (isPushSubscribed || permState === 'granted') {
        await unsubscribeUserFromPush();
        setIsPushSubscribed(false);
        setPushMsg("Desktop notifications disabled.");
      } else {
        await subscribeUserToPush();
        setIsPushSubscribed(true);
        setPermState('granted');
        setPushMsg("✅ Desktop notifications enabled successfully! Test notification sent to Windows.");
      }
    } catch (err) {
      console.error("Push toggle error:", err);
      const perm = getNotificationPermissionState();
      setPermState(perm);
      if (perm === 'denied') {
        setPushError("Windows/Chrome notifications are currently blocked. Please enable notifications for Google Chrome in Windows Settings or click the lock icon in the browser address bar.");
      } else {
        setPushError(err.message || "Failed to enable desktop notifications.");
      }
    } finally {
      setPushLoading(false);
    }
  };

  const handleDirectTestNotification = () => {
    setPushMsg('');
    setPushError('');
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        setPermState(perm);
        if (perm === 'granted') {
          showDesktopNotification(
            "🔔 University AI Assistant",
            "Desktop notifications are now enabled successfully! This is a real Windows desktop notification popup."
          );
          setPushMsg("Triggered native Windows desktop notification toast!");
        } else {
          setPushError("Windows/Chrome notifications are currently blocked. Please enable notifications for Google Chrome in Windows Settings.");
        }
      });
    } else {
      const notif = showDesktopNotification(
        "🔔 University AI Assistant",
        "Desktop notifications are working! This is a real Windows desktop notification popup outside the website."
      );
      if (notif) {
        setPushMsg("Sent real Windows desktop notification popup toast!");
      } else {
        setPushError("Could not trigger notification. Please check Chrome/Windows Notification settings.");
      }
    }
  };

  const handleTriggerRealEventTest = async (eventType) => {
    setPushMsg('');
    setPushError('');
    try {
      const res = await API.post('/notifications/test-event', { event_type: eventType });
      const eventData = res.data.event;
      setPushMsg(`Triggered real event: ${eventData.title}`);

      // Fire direct OS Desktop Notification immediately
      showDesktopNotification(eventData.title, eventData.message, '/dashboard');
    } catch (err) {
      setPushError("Failed to trigger test event.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    try {
      await API.put('/student/profile', { name, phone, section });
      setProfileMsg("Profile updated successfully!");

      // Trigger real OS Desktop Notification for profile update
      showDesktopNotification("👤 Profile Updated", "Your student profile information has been updated.", "/settings");
    } catch (err) {
      setProfileError(err.response?.data?.error || "Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    try {
      await API.put('/student/password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      setPasswordMsg("Password changed successfully!");
      setOldPassword('');
      setNewPassword('');

      // Trigger real OS Desktop Notification for password reset
      showDesktopNotification("🔐 Password Changed", "Your student account password has been updated successfully.", "/settings");
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Failed to change password.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-gray-900 selection:bg-primary-container selection:text-white pb-20">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Hero Banner */}
        <section className="bg-gray-900 text-white rounded-xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Portal Preferences & Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-body font-medium">Manage your Windows OS system notifications, student profile identity, and security channels.</p>
          </div>

          <div className="flex items-center gap-2 py-1.5 px-3 bg-amber-300 text-gray-950 rounded text-xs font-label font-extrabold uppercase shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 text-gray-950" />
            <span>ABES Student Portal</span>
          </div>
        </section>

        {/* Profile Identity Card */}
        {user && (
          <section>
            <div className="bg-white rounded-xl p-5 border border-gray-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-gray-900 text-amber-300 flex items-center justify-center font-bold text-xl shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-gray-900">{user.name}</h3>
                  <p className="text-xs text-gray-700 font-body font-bold">{user.course} • {user.semester}</p>
                  <p className="text-[11px] text-red-800 font-mono font-bold">{user.student_id}</p>
                </div>
              </div>

              <div className="bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1 rounded text-xs font-label font-extrabold uppercase tracking-wider self-start sm:self-center">
                {user.role === 'admin' ? 'Administrator' : 'Verified Student'}
              </div>
            </div>
          </section>
        )}

        {/* REAL DESKTOP & WINDOWS NOTIFICATIONS SECTION */}
        <section className="bg-white rounded-xl p-6 border border-gray-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h3 className="font-headline text-lg font-bold text-gray-900 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-red-800" />
                🔔 Desktop Notifications
              </h3>
              <p className="font-body text-xs text-gray-700 font-medium">Real native Windows OS desktop notifications (outside the browser webpage)</p>
            </div>

            <div className="flex items-center gap-2">
              {permState === 'granted' ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-label font-extrabold rounded flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-700" /> ✅ Desktop Notifications Enabled
                </span>
              ) : permState === 'denied' ? (
                <span className="px-3 py-1 bg-red-100 text-red-950 border border-red-300 text-xs font-label font-extrabold rounded flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-700" /> ❌ Disabled (Blocked in Windows/Chrome)
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-300 text-xs font-label font-extrabold rounded">
                  ❌ Disabled
                </span>
              )}
            </div>
          </div>

          {pushMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-label font-bold flex items-center gap-2 shadow-xs">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{pushMsg}</span>
            </div>
          )}

          {pushError && (
            <div className="p-3.5 bg-red-50 border border-red-300 text-red-950 rounded-lg text-xs font-label font-bold flex items-center gap-2 shadow-xs">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{pushError}</span>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-headline font-bold text-xs text-gray-900 block">Windows System Toast Popups</span>
                <p className="text-xs text-gray-700 font-body">Triggers real operating system popups in the bottom-right corner of your laptop screen.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTogglePush}
                  disabled={pushLoading}
                  className={`px-4 py-2 rounded-lg text-xs font-label font-extrabold transition-all shadow-xs shrink-0 ${
                    permState === 'granted'
                      ? 'bg-emerald-800 text-white hover:bg-emerald-900'
                      : 'bg-gray-900 text-amber-300 hover:bg-red-800 hover:text-white'
                  }`}
                >
                  {pushLoading ? 'Processing...' : permState === 'granted' ? '✅ Desktop Notifications Enabled' : 'Enable Desktop Notifications'}
                </button>

                <button
                  onClick={handleDirectTestNotification}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-950 font-label font-extrabold rounded-lg text-xs transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-gray-950" />
                  <span>Send Test Desktop Notification</span>
                </button>
              </div>
            </div>

            {/* QUICK REAL EVENT TEST BUTTONS */}
            <div className="pt-3 border-t border-gray-200">
              <span className="font-label font-extrabold text-[11px] text-gray-900 uppercase tracking-wider block mb-2">
                Test Real University Event Notifications (Windows Popup)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleTriggerRealEventTest('deadline')}
                  className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-lg text-xs font-label font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>⏰ Deadline Reminder</span>
                </button>

                <button
                  onClick={() => handleTriggerRealEventTest('ticket')}
                  className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-lg text-xs font-label font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Ticket className="w-3.5 h-3.5 text-blue-600" />
                  <span>🎫 Support Ticket Updated</span>
                </button>

                <button
                  onClick={() => handleTriggerRealEventTest('notice')}
                  className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-lg text-xs font-label font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Megaphone className="w-3.5 h-3.5 text-red-600" />
                  <span>📢 University Notice</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PROFILE INFORMATION UPDATE FORM */}
        <section className="bg-white rounded-xl p-6 border border-gray-300 shadow-xs space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <h3 className="font-headline text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-red-800" />
              Student Profile Information
            </h3>
            <p className="font-body text-xs text-gray-700 font-medium">Update your student details (triggers real 👤 Profile Updated desktop notification)</p>
          </div>

          {profileMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-label font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{profileMsg}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-950 rounded-lg text-xs font-label font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 font-label text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-900 font-bold mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-1 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91-9876543210"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-bold mb-1 uppercase">Section</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Section A"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gray-900 hover:bg-red-800 text-white font-label font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              Update Profile Information
            </button>
          </form>
        </section>

        {/* PASSWORD CHANGE FORM */}
        <section className="bg-white rounded-xl p-6 border border-gray-300 shadow-xs space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <h3 className="font-headline text-lg font-bold text-gray-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-red-800" />
              Account Password & Security
            </h3>
            <p className="font-body text-xs text-gray-700 font-medium">Change account password (triggers real 🔐 Password Changed desktop notification)</p>
          </div>

          {passwordMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-label font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{passwordMsg}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-950 rounded-lg text-xs font-label font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 font-label text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-900 font-bold mb-1 uppercase">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-1 uppercase">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gray-900 hover:bg-red-800 text-white font-label font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              Update Password
            </button>
          </form>
        </section>

        {/* LOGOUT BUTTON */}
        <div className="pt-2">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-950 font-label font-extrabold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors border border-red-300"
          >
            <LogOut className="w-4 h-4 text-red-800" />
            <span>Log Out of ABES Student Account</span>
          </button>
        </div>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
