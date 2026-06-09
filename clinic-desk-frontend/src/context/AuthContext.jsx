import React, { createContext, useContext, useState, useEffect } from 'react';
import client, { setAccessToken, getAccessToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await client.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
      setAccessToken('');
    }
  };

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await client.post('/auth/login', { email: usernameOrEmail, password });
      const { accessToken, user: userData } = response.data;
      setAccessToken(accessToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const register = async (data) => {
    try {
      const response = await client.post('/auth/register', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch (error) {
      console.error('Logout API failed', error);
    } finally {
      setAccessToken('');
      setUser(null);
    }
  };

  // Check initial authentication status via token refresh
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await client.post('/auth/refresh');
        const { accessToken } = response.data;
        setAccessToken(accessToken);
        await fetchProfile();
      } catch (error) {
        // No valid session found, user needs to login
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listen to unauthorized interceptor events
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken('');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
