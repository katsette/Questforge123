import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { registerUser, loginUser, logoutUser, subscribeToAuthChanges } from '../services/authService';
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
        user: action.payload,
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
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
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
  isAuthenticated: false,
  loading: true, // Set to true initially to indicate auth state is being checked
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await loginUser(email, password);
      toast.success(`Welcome back, ${user.email}!`);
      return user;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await registerUser(email, password);
      toast.success(`Welcome to QuestForge, ${user.email}!`);
      return user;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
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
      await logoutUser();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
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
