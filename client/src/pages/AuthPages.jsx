import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { showDesktopNotification } from '../services/desktopNotifications';
import { Lock, Mail, User, AlertCircle, ArrowRight, Sparkles, CheckCircle2, Eye, EyeOff, KeyRound, RefreshCw, Hash } from 'lucide-react';

export function LoginPage() {
  const { user: authUser, login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null); // 'student' | 'admin' | null

  // Ensure no error on page mount and auto-redirect if already logged in
  useEffect(() => {
    setError('');
    if (authUser) {
      if (authUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [authUser, navigate]);

  const handleLogin = async (idVal, passVal, isDemo = false, demoType = '') => {
    if (!idVal.trim() || !passVal) {
      setError("Please enter your Student ID / Email and password.");
      return;
    }

    setError('');
    setLoading(true);
    if (isDemo) setDemoLoading(demoType);

    try {
      const user = await login(idVal.trim(), passVal);

      // Trigger REAL Windows Desktop Notification ONLY on successful authentication
      showDesktopNotification(
        "🔐 New Login Detected",
        "A new login to your ABES Student Portal account was detected."
      );

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login failed:", err);
      if (!err.response) {
        setError("Unable to connect to the backend authentication service at http://127.0.0.1:5000. Please verify the server is running.");
      } else if (err.response.status === 401) {
        setError("Invalid Student ID/email or password. Please verify your credentials.");
      } else if (err.response.status === 400) {
        setError(err.response.data?.error || "Validation error: Please provide both Student ID/Email and password.");
      } else if (err.response.status === 500) {
        setError(err.response.data?.error || "Database or internal server error occurred. Please try again later.");
      } else {
        setError(err.response.data?.error || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
      setDemoLoading(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(identifier, password);
  };

  const handleDemoStudent = () => {
    setIdentifier("student101@abcuniversity.edu");
    setPassword("student123");
    handleLogin("student101@abcuniversity.edu", "student123", true, 'student');
  };

  const handleDemoAdmin = () => {
    setIdentifier("admin@abcuniversity.edu");
    setPassword("admin123");
    handleLogin("admin@abcuniversity.edu", "admin123", true, 'admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-gray-900 font-body selection:bg-red-800 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <img 
              src="/images/abes_logo_icon.png" 
              alt="ABES Engineering College Logo" 
              className="h-14 w-auto object-contain mx-auto rounded-xl shadow-xs" 
            />
            <h1 className="text-2xl font-headline font-bold text-gray-900">Student & Staff Sign In</h1>
            <p className="text-xs font-body font-semibold text-gray-600">ABES Engineering College Autonomous Portal</p>
          </div>

          {/* One-Click Quick Demo Sign In */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-red-900 font-label font-extrabold text-xs">
                <Sparkles className="w-4 h-4 text-red-800" />
                <span>One-Click Quick Demo Sign In:</span>
              </span>
              <span className="text-[10px] font-label font-bold text-gray-500">Preset Accounts</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDemoStudent}
                disabled={loading}
                className="py-2 px-3 bg-white hover:bg-red-50 text-gray-900 hover:text-red-900 rounded-lg font-label font-extrabold text-xs border border-gray-300 hover:border-red-300 shadow-2xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {demoLoading === 'student' ? (
                  <span className="w-3.5 h-3.5 border-2 border-red-800 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <User className="w-3.5 h-3.5 text-red-800" />
                )}
                <span>Student (Aman)</span>
              </button>

              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={loading}
                className="py-2 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-label font-extrabold text-xs border border-gray-900 shadow-2xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {demoLoading === 'admin' ? (
                  <span className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

          {/* Conditional Error Message — ONLY rendered when an actual error occurs */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-950 rounded-xl text-xs font-label font-bold flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-700" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1.5">
                Student ID / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  placeholder="e.g. STU1001 or student101@abcuniversity.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-body font-medium text-gray-900 focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-body font-medium text-gray-900 focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-800 hover:bg-red-700 text-white font-label font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading && !demoLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Authenticating...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs font-body text-gray-700 font-semibold border-t border-gray-100">
            Don't have a student account yet?{' '}
            <Link to="/register" className="font-label font-extrabold text-red-800 hover:underline">
              Register with Email OTP
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


export function RegisterPage() {
  const { sendOtp, verifyOtp, register: registerUser } = useAuth();
  const navigate = useNavigate();

  // Wizard Step: 1 = Student Info, 2 = OTP Verification, 3 = Password Creation
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    course: 'B.Tech Computer Science',
    branch: 'CSE',
    semester: 'Semester 1',
    section: 'Section A',
    phone: '',
    password: '',
    confirm_password: ''
  });

  const [otpInput, setOtpInput] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.student_id || !formData.email) {
      setError("Please fill in your Full Name, Student ID, and Email address.");
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await sendOtp(formData.email, formData.name, formData.student_id);
      setMessage(res.message || `OTP sent to ${formData.email}`);
      setResendTimer(60);
      setStep(2);
    } catch (err) {
      console.error("Send OTP failed:", err);
      setError(err.response?.data?.error || "Failed to send verification OTP. Check email or student ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setError("Please enter the complete 6-digit OTP verification code.");
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await verifyOtp(formData.email, otpInput.trim());
      setIsOtpVerified(true);
      setMessage(res.message || "OTP verified successfully!");
      setStep(3);
    } catch (err) {
      console.error("Verify OTP failed:", err);
      setError(err.response?.data?.error || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await sendOtp(formData.email, formData.name, formData.student_id);
      setMessage(`New OTP code sent to ${formData.email}`);
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!formData.password || !formData.confirm_password) {
      setError("Please enter and confirm your password.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await registerUser(formData);

      // Trigger REAL Windows Desktop Notification on successful registration
      showDesktopNotification(
        "🎉 Account Created Successfully",
        "Your ABES student account has been created successfully."
      );

      navigate('/dashboard');
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.error || "Registration failed. Student ID or Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-gray-900 font-body selection:bg-primary-container selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-xl w-full bg-white rounded-xl p-6 sm:p-8 border border-gray-300 shadow-md space-y-6">
          {/* Header & Step Wizard Indicator */}
          <div className="text-center space-y-2">
            <img 
              src="/images/abes_logo_icon.png" 
              alt="ABES Engineering College Logo" 
              className="h-14 w-auto object-contain mx-auto rounded-xl shadow-xs" 
            />
            <h1 className="text-2xl font-headline font-bold text-gray-900">Student Registration Portal</h1>
            <p className="text-xs font-body font-semibold text-gray-700">ABES Engineering College Verified Account Creation</p>
            
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className={`px-3 py-1 rounded text-[11px] font-label font-bold uppercase ${step === 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800'}`}>
                1. Student Info
              </div>
              <span className="text-gray-400 text-xs">•</span>
              <div className={`px-3 py-1 rounded text-[11px] font-label font-bold uppercase ${step === 2 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800'}`}>
                2. Email OTP
              </div>
              <span className="text-gray-400 text-xs">•</span>
              <div className={`px-3 py-1 rounded text-[11px] font-label font-bold uppercase ${step === 3 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800'}`}>
                3. Create Password
              </div>
            </div>
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-label font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-950 rounded-lg text-xs font-label font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1 FORM: Student Academic Information */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1">
                    Student ID *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      placeholder="e.g. STU1005"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Aman Choudhary"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1">
                  Email Address (OTP Verification) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@abcuniversity.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1">
                    Course / Degree
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none focus:border-gray-900 transition-all"
                  >
                    <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                    <option value="B.Tech AIML">B.Tech AI & Machine Learning</option>
                    <option value="B.Tech Data Science">B.Tech Data Science</option>
                    <option value="B.Tech Electronics & Comm">B.Tech ECE</option>
                    <option value="B.Tech Mechanical Eng">B.Tech Mechanical</option>
                    <option value="MCA">MCA</option>
                    <option value="BCA">BCA</option>
                    <option value="M.Tech CSE">M.Tech CSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none focus:border-gray-900 transition-all"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-red-800 text-white font-label font-bold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Sending Verification OTP..." : "Send 6-Digit Verification OTP"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2 FORM: 6-Digit Email OTP Input */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center p-4 bg-gray-100 rounded-lg border border-gray-300 space-y-1">
                <p className="text-xs font-label font-extrabold text-gray-900">Enter Verification Code</p>
                <p className="text-[11px] font-body text-gray-800 font-medium">
                  We sent a 6-digit OTP code to <strong className="text-red-800">{formData.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1 text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] text-xl font-mono py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 transition-all font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs font-label">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-800 hover:text-black font-bold underline"
                >
                  ← Edit Student Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className={`flex items-center gap-1 font-bold ${resendTimer > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-red-800 hover:underline'}`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-red-800 text-white font-label font-bold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Verifying OTP..." : "Verify OTP Code"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3 FORM: Create & Confirm Password */}
          {step === 3 && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-label font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Email verified! Create a secure password to complete student registration.</span>
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-red-800 text-white font-label font-bold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Creating Account..." : "Complete Registration & Sign In"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2 text-xs font-body text-gray-700 font-semibold">
            Already have a student account?{' '}
            <Link to="/login" className="font-label font-extrabold text-red-800 hover:underline">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
