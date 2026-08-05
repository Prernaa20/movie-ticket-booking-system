import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cinepass_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore user session on application load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to restore user session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;

    localStorage.setItem('cinepass_token', access_token);
    localStorage.setItem('cinepass_user', JSON.stringify(userData));

    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, fullName, password) => {
    const response = await api.post('/auth/register', {
      email,
      full_name: fullName,
      password,
    });
    const { access_token, user: userData } = response.data;

    localStorage.setItem('cinepass_token', access_token);
    localStorage.setItem('cinepass_user', JSON.stringify(userData));

    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('cinepass_token');
    localStorage.removeItem('cinepass_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
