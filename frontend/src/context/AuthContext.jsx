import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import logger from '../utils/logger';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          logger.debug('Initializing auth state with token');
          const userData = await authService.getCurrentUser();
          setUser(userData);
          logger.info('User authenticated', { userId: userData.id });
        } catch (err) {
          logger.error('Failed to authenticate with token', err);
          localStorage.removeItem('token');
          setToken(null);
          setError('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      logger.debug('Registering new user', { email: userData.email });
      const response = await authService.register(userData);
      
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      
      logger.info('User registered successfully', { userId: response.user.id });
      return response.user;
    } catch (err) {
      logger.error('Registration failed', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      logger.debug('Logging in user', { email: credentials.email });
      const response = await authService.login(credentials);
      
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      
      logger.info('User logged in successfully', { userId: response.user.id });
      return response.user;
    } catch (err) {
      logger.error('Login failed', err);
      setError(err.response?.data?.message || 'Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    logger.debug('Logging out user');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    logger.info('User logged out');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      logger.debug('Updating user profile');
      const updatedUser = await authService.updateProfile(profileData);
      
      setUser(updatedUser);
      
      logger.info('Profile updated successfully');
      return updatedUser;
    } catch (err) {
      logger.error('Profile update failed', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear any auth errors
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;