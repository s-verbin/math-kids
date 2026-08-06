import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    await submitPendingGuestLesson();
    return response.data;
  };

  const register = async (username, password, displayName, avatar, acceptedTerms) => {
    const response = await authAPI.register({ username, password, displayName, avatar, acceptedTerms });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    await submitPendingGuestLesson();
    return response.data;
  };

  const submitPendingGuestLesson = async () => {
    try {
      const pending = localStorage.getItem('pendingGuestLesson');
      if (!pending) return;

      const lessonData = JSON.parse(pending);
      const { lessonsAPI } = await import('../services/api');
      
      await lessonsAPI.submit({
        topicId: lessonData.topicId,
        answers: lessonData.answers,
        timeSpent: lessonData.timeSpent
      });

      localStorage.removeItem('pendingGuestLesson');
    } catch (error) {
      console.error('Error submitting pending guest lesson:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

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
