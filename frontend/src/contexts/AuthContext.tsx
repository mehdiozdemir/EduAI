// Authentication context for global user state management

import React, {
  createContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import { TokenManager } from '../services/api';
import type { User, LoginCredentials, RegisterData } from '../types';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check existing session
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Set up token expiry check
  useEffect(() => {
    if (state.isAuthenticated) {
      const checkTokenExpiry = () => {
        const token = TokenManager.getToken();
        if (!token) {
          handleLogout();
          return;
        }

        try {
          // Decode JWT token to check expiry (basic implementation)
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Date.now() / 1000;

            if (payload.exp && payload.exp < currentTime) {
              handleLogout();
            }
          }
        } catch (error) {
          // If token is malformed, logout
          console.warn('Invalid token format:', error);
          handleLogout();
        }
      };

      // Check token expiry every minute
      const interval = setInterval(checkTokenExpiry, 60000);

      // Check immediately
      checkTokenExpiry();

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated]);

  // Check authentication status
  const checkAuthStatus = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const token = TokenManager.getToken();
      if (!token) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      // Try to get current user profile
      const user = await authService.getProfile();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch {
      // If profile fetch fails, clear tokens and logout
      TokenManager.removeToken();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const user = await authService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const user = await authService.register(userData);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    console.log('AuthContext.logout called');
    try {
      await authService.logout();
      console.log('AuthService.logout completed, calling handleLogout');
      handleLogout();
    } catch (error: unknown) {
      console.warn('Logout API call failed:', error);
      console.log('Calling handleLogout despite error');
      handleLogout();
      throw error; // Re-throw for component error handling
    }
  };

  // Handle logout (clear state)
  const handleLogout = (): void => {
    console.log('AuthContext.handleLogout called - clearing token and state');
    TokenManager.removeToken();
    dispatch({ type: 'AUTH_LOGOUT' });
    console.log('AuthContext logout state cleared');
    
    // Redirect to login page
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Default export for the provider component (Fast Refresh compatible)
export default AuthProvider;

// Export the context and type for use in separate hook file
export { AuthContext };
export type { AuthContextType };
