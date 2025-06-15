import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AuthActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
    case AuthActionTypes.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.LOGIN_FAILURE:
    case AuthActionTypes.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case AuthActionTypes.LOGOUT:
    case AuthActionTypes.TOKEN_EXPIRED:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };

    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          const user = authAPI.getCurrentUser();
          if (user) {
            dispatch({
              type: AuthActionTypes.SET_USER,
              payload: { user },
            });
          } else {
            // Try to fetch user profile if token exists but no user data
            const response = await authAPI.getProfile();
            if (response.success) {
              dispatch({
                type: AuthActionTypes.SET_USER,
                payload: { user: response.data.user },
              });
            } else {
              dispatch({ type: AuthActionTypes.LOGOUT });
            }
          }
        } else {
          dispatch({
            type: AuthActionTypes.SET_LOADING,
            payload: { isLoading: false },
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AuthActionTypes.LOGOUT });
      }
    };

    initializeAuth();

    // Listen for token expiration events
    const handleTokenExpired = () => {
      dispatch({ type: AuthActionTypes.TOKEN_EXPIRED });
    };

    window.addEventListener('auth:tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:tokenExpired', handleTokenExpired);
    };
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user: response.data.user },
        });
        return { success: true };
      } else {
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: { error: response.message },
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AuthActionTypes.REGISTER_START });
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        dispatch({
          type: AuthActionTypes.REGISTER_SUCCESS,
          payload: { user: response.data.user },
        });
        return { success: true };
      } else {
        dispatch({
          type: AuthActionTypes.REGISTER_FAILURE,
          payload: { error: response.message },
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: AuthActionTypes.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    dispatch({
      type: AuthActionTypes.SET_USER,
      payload: { user: updatedUser },
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for route protection
export const withAuth = (Component, allowedRoles = []) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show login component
      return <LoginPage />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;