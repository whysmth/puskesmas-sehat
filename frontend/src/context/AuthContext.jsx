import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create a custom axios instance
export const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('simpus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Response interceptor to handle token expiry / unauthorized errors
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err.response && err.response.status === 401) {
          logout();
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('simpus_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.status === 'success') {
            setUser(res.data.data.user);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.status === 'success') {
        const { token, user } = res.data.data;
        localStorage.setItem('simpus_token', token);
        setUser(user);
        return user;
      }
      throw new Error(res.data.message || 'Login gagal.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Username atau password salah.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('simpus_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
