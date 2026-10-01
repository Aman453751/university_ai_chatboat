import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || '';
    } catch (e) {
      return '';
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication session on app start
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Verify JWT token with backend /api/auth/me endpoint
          const res = await API.get('/auth/me');
          if (isMounted) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error("Auth token verification error:", err);
          // Only clear auth if explicitly rejected with 401 or 403 (invalid/expired token)
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            if (isMounted) {
              logout();
            }
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const sendOtp = async (email, name, studentId) => {
    const res = await API.post('/auth/send-otp', { email, name, student_id: studentId });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await API.post('/auth/verify-otp', { email, otp });
    return res.data;
  };

  const login = async (identifier, password) => {
    const res = await API.post('/auth/login', { identifier, password });
    const { token: authToken, user: userData } = res.data;

    // 1. Immediately write to localStorage so interceptors and subsequent calls have access
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    // 2. Update React auth state
    setToken(authToken);
    setUser(userData);

    return userData;
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    const { token: authToken, user: userData } = res.data;

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(authToken);
    setUser(userData);

    return userData;
  };

  const logout = async () => {
    const currentToken = localStorage.getItem('token');
    try {
      if (currentToken) {
        await API.post('/auth/logout');
      }
    } catch (e) {
      console.log("Logout cleanup completed.");
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken('');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      sendOtp,
      verifyOtp,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
