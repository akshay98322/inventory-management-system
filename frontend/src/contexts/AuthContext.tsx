import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  token: string | null;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { user: { username: string }; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_TOKEN'; payload: string };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return initialState;
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (user: { username: string }, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (user: { username: string }, token: string) => {
    localStorage.setItem('access_token', token);
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    dispatch({ type: 'LOGOUT' });
  };

  const setToken = (token: string) => {
    localStorage.setItem('access_token', token);
    dispatch({ type: 'SET_TOKEN', payload: token });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};