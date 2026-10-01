import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import ChatbotPage from './pages/ChatbotPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import CommunityPage from './pages/CommunityPage';
import InsightsPage from './pages/InsightsPage';
import FAQPage from './pages/FAQPage';
import SettingsPage from './pages/SettingsPage';
import ABESInfoPage from './pages/ABESInfoPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DesktopNotificationSync from './components/DesktopNotificationSync';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface font-body">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-gray-900 text-xs font-label font-bold">Authenticating Student Session...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <DesktopNotificationSync />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about-abes" element={<ABESInfoPage />} />
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
