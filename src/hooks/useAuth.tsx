/**
 * Authentication Context and Hook
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  getCachedUser,
  isAuthenticated as checkAuth,
  generateApiKey as apiGenerateApiKey,
  revokeApiKey as apiRevokeApiKey,
  refreshToken as apiRefreshToken,
  type LoginRequest,
  type RegisterRequest,
  type UserResponse,
  type TokenResponse,
  type ApiKeyResponse,
} from '@/lib/api/auth';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  generateApiKey: () => Promise<ApiKeyResponse>;
  revokeApiKey: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(getCachedUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkAuth());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (checkAuth()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Token might be expired, try to refresh
          try {
            await apiRefreshToken();
            const userData = await getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
          } catch (refreshError) {
            // Refresh failed, clear auth
            apiLogout();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      await apiLogin(credentials);
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await apiRegister(data);
      // Auto-login after registration
      await login({ email: data.email, password: data.password });
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  const refreshUser = async () => {
    if (isAuthenticated) {
      const userData = await getCurrentUser();
      setUser(userData);
    }
  };

  const generateApiKey = async (): Promise<ApiKeyResponse> => {
    const response = await apiGenerateApiKey();
    await refreshUser(); // Refresh user data
    return response;
  };

  const revokeApiKey = async (): Promise<void> => {
    await apiRevokeApiKey();
    await refreshUser(); // Refresh user data
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    generateApiKey,
    revokeApiKey,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
