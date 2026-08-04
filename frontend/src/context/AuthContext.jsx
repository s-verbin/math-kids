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
      console.log('🔄 Loading user profile...');
      const response = await userAPI.getProfile();
      console.log('✅ User profile loaded:', response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      console.error('❌ Error details:', error.response?.status, error.response?.data);
      console.log('⚠️ NOT removing token - debugging mode');
      // localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });
    console.log('🔐 Login response:', response.data);
    console.log('💾 Saving token to localStorage:', response.data.token);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    console.log('✅ Token saved, user set:', response.data.user);
    return response.data;
  };

  const register = async (username, password, displayName, avatar) => {
    const response = await authAPI.register({ username, password, displayName, avatar });
    console.log('🔐 Register response:', response.data);
    console.log('💾 Saving token to localStorage:', response.data.token);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    console.log('✅ Token saved, user set:', response.data.user);
    return response.data;
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
