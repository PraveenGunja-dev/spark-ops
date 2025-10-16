/**
 * Authentication API Service
 */

import { apiPost, apiGet, apiDelete } from '../api-client';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role?: 'owner' | 'admin' | 'developer' | 'viewer';
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyResponse {
  api_key: string;
  user: UserResponse;
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<UserResponse> {
  return apiPost<UserResponse>('/auth/register', data);
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  const response = await apiPost<TokenResponse>('/auth/login', credentials);
  
  // Store tokens in localStorage
  localStorage.setItem('access_token', response.access_token);
  localStorage.setItem('refresh_token', response.refresh_token);
  
  return response;
}

/**
 * Logout - clear tokens
 */
export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('api_key');
  localStorage.removeItem('user');
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<TokenResponse> {
  const refresh_token = localStorage.getItem('refresh_token');
  
  if (!refresh_token) {
    throw new Error('No refresh token available');
  }
  
  const response = await apiPost<TokenResponse>('/auth/refresh', { refresh_token });
  
  // Update access token
  localStorage.setItem('access_token', response.access_token);
  
  return response;
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const user = await apiGet<UserResponse>('/auth/me');
  
  // Cache user in localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  return user;
}

/**
 * Generate API key
 */
export async function generateApiKey(): Promise<ApiKeyResponse> {
  const response = await apiPost<ApiKeyResponse>('/auth/api-key');
  
  // Store API key
  localStorage.setItem('api_key', response.api_key);
  
  return response;
}

/**
 * Revoke API key
 */
export async function revokeApiKey(): Promise<{ message: string }> {
  const response = await apiDelete<{ message: string }>('/auth/api-key');
  
  // Remove API key from localStorage
  localStorage.removeItem('api_key');
  
  return response;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('access_token');
  const apiKey = localStorage.getItem('api_key');
  return !!(token || apiKey);
}

/**
 * Get cached user from localStorage
 */
export function getCachedUser(): UserResponse | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
