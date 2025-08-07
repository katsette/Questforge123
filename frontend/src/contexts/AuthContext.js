import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService, api } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const lastTokenVerification = localStorage.getItem('lastTokenVerification');
      const now = Date.now();
      
      if (token) {
        // Check if we've verified the token recently (within 5 minutes)
        if (lastTokenVerification && (now - parseInt(lastTokenVerification)) < 5 * 60 * 1000) {
          // Skip verification if we've verified recently and just use cached user data
          const cachedUser = localStorage.getItem('cachedUser');
          if (cachedUser) {
            try {
              const user = JSON.parse(cachedUser);
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: user,
                  token: token
                }
              });
              console.log('✅ Using cached authentication data');
              return;
            } catch (e) {
              console.warn('Failed to parse cached user data:', e);
            }
          }
        }
        
        // Verify token with backend
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          console.log('🔍 Verifying authentication token...');
          const response = await authService.verifyToken();
          
          // Cache successful verification
          localStorage.setItem('lastTokenVerification', now.toString());
          localStorage.setItem('cachedUser', JSON.stringify(response.user));
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.user,
              token: token
            }
          });
          console.log('✅ Token verification successful');
          
        } catch (error) {
          console.log('❌ Token verification failed:', error.response?.data?.message || error.message);
          
          // Clear all auth-related localStorage data
          localStorage.removeItem('token');
          localStorage.removeItem('lastTokenVerification');
          localStorage.removeItem('cachedUser');
          
          dispatch({ type: 'LOGOUT' });
          
          // Only show error message if it's an actual session expiry, not network issues
          if (error.response?.status === 401) {
            toast.error('Your session has expired. Please log in again.');
          } else if (error.code === 'NETWORK_ERROR' || !error.response) {
            console.warn('Network error during token verification - will retry on next interaction');
          }
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        // No token found, ensure clean state
        localStorage.removeItem('lastTokenVerification');
        localStorage.removeItem('cachedUser');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      
      // Cache authentication data
      localStorage.setItem('token', response.token);
      localStorage.setItem('lastTokenVerification', Date.now().toString());
      localStorage.setItem('cachedUser', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });
      toast.success(`Welcome back, ${response.user.username}!`);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register(userData);
      
      // Cache authentication data
      localStorage.setItem('token', response.token);
      localStorage.setItem('lastTokenVerification', Date.now().toString());
      localStorage.setItem('cachedUser', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });
      toast.success(`Welcome to QuestForge, ${response.user.username}!`);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear all auth-related localStorage data
    localStorage.removeItem('token');
    localStorage.removeItem('lastTokenVerification');
    localStorage.removeItem('cachedUser');
    
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.user
      });
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Authenticated fetch wrapper
  const authFetch = async (url, options = {}) => {
    try {
      const apiInstance = await api();
      const response = await apiInstance({
        url: url.startsWith('/api') ? url.substring(4) : url, // Remove /api prefix if present
        method: options.method || 'GET',
        data: options.body ? JSON.parse(options.body) : undefined,
        headers: {
          ...options.headers
        },
        ...options
      });
      
      // Return a response-like object for compatibility with fetch API
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText,
        json: async () => response.data,
        text: async () => JSON.stringify(response.data)
      };
    } catch (error) {
      // Handle axios errors and convert to fetch-like response
      if (error.response) {
        return {
          ok: false,
          status: error.response.status,
          statusText: error.response.statusText,
          json: async () => error.response.data,
          text: async () => JSON.stringify(error.response.data)
        };
      }
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    authFetch
  };

  return (
    <AuthContext.Provider value={value}>
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
