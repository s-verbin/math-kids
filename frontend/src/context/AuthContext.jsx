import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI, analyticsAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getBrowser = (ua) => {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    return 'Other';
  };

  const getOS = (ua) => {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Other';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (username, password, displayName, avatar) => {
    const response = await authAPI.register({ username, password, displayName, avatar });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('analyticsSessionId');
    setUser(null);
  };

  useEffect(() => {
    if (!user || sessionStorage.getItem('analyticsSessionId')) return;
    const start = async () => {
      try {
        const ua = navigator.userAgent;
        const res = await analyticsAPI.startSession({
          userAgent: ua,
          screen: `${window.screen.width}x${window.screen.height}`,
          deviceType: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop',
          browser: getBrowser(ua),
          os: getOS(ua)
        });
        sessionStorage.setItem('analyticsSessionId', res.data.sessionId);
      } catch {}
    };
    start();
  }, [user]);

  useEffect(() => {
    const end = () => {
      const sessionId = sessionStorage.getItem('analyticsSessionId');
      if (!sessionId) return;
      const token = localStorage.getItem('token');
      if (!token) return;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      fetch(`${API_URL}/analytics/end`, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });
      sessionStorage.removeItem('analyticsSessionId');
    };
    window.addEventListener('beforeunload', end);
    return () => window.removeEventListener('beforeunload', end);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
