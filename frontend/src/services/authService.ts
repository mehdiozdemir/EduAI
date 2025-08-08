// Authentication service for login, register, and logout operations

import { BaseApiService, TokenManager } from './api';
import type { User, LoginCredentials, RegisterData } from '../types';

export class AuthService extends BaseApiService {
  private currentUser: User | null = null;

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // First clear any existing data
      TokenManager.removeToken();
      this.currentUser = null;
      
      // Backend login implementation
      const loginData = {
        email: credentials.email,
        password: credentials.password
      };

      const response = await this.post<{
        access_token: string;
        token_type: string;
        user: User;
      }>(' /api/v1/auth/login'.trim(), loginData);

      // Store tokens
      TokenManager.setToken(response.access_token);
      // No refresh token support in backend; keep TokenManager usage consistent
      
      // Store user data
      this.currentUser = response.user;
      
      return response.user;
    } catch (error: any) {
      // Handle specific error messages from backend
      if (error.message === 'Invalid credentials') {
        throw new Error('Geçersiz e-posta veya şifre');
      }
      throw new Error(error.message || 'Giriş yapılırken bir hata oluştu');
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<User> {
    try {
      // Backend register implementation
      const registerData = {
        username: userData.username,
        email: userData.email,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        password: userData.password
      };

      const response = await this.post<{
        access_token: string;
        token_type: string;
        user: User;
      }>(' /api/v1/auth/register'.trim(), registerData);

      // Store tokens
      TokenManager.setToken(response.access_token);
      
      // Store user data
      this.currentUser = response.user;
      
      return response.user;
    } catch (error: any) {
      // Handle specific error messages from backend
      if (error.message === 'Username or email already registered') {
        throw new Error('Bu kullanıcı adı veya e-posta zaten kayıtlı');
      }
      throw new Error(error.message || 'Kayıt olurken bir hata oluştu');
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await this.post('/api/v1/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear local data
      TokenManager.removeToken();
      this.currentUser = null;
      // Force clear any cached data
      localStorage.clear();
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    return !!token && !!this.currentUser;
  }

  /**
   * Get current user profile from API
   */
  async getProfile(): Promise<User> {
    try {
      // Prefer users/me endpoint for consistency
      const user = await this.get<User>('/api/v1/users/me');
      this.currentUser = user;
      return user;
    } catch (error: any) {
      console.error('Profile fetch failed:', error);
      // If token is invalid, clear it
      TokenManager.removeToken();
      this.currentUser = null;
      throw new Error('Kullanıcı oturumu bulunamadı');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    // Backend user profile update is under /users/me
    const updatedUser = await this.put<User>('/api/v1/users/me', userData);
    this.currentUser = updatedUser;
    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Backend change password endpoint: /users/me/change-password
    await this.post('/api/v1/users/me/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(_email: string): Promise<void> {
    // Not implemented on backend
    throw new Error('Şifre sıfırlama uç noktası backendde tanımlı değil');
  }

  /**
   * Reset password with token
   */
  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    // Not implemented on backend
    throw new Error('Şifre sıfırlama uç noktası backendde tanımlı değil');
  }

  /**
   * Verify email with token
   */
  async verifyEmail(_token: string): Promise<void> {
    // Not implemented on backend
    throw new Error('E-posta doğrulama uç noktası backendde tanımlı değil');
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    // Not implemented on backend
    throw new Error('E-posta doğrulama yeniden gönderme uç noktası backendde tanımlı değil');
  }
}

// Create and export singleton instance
export const authService = new AuthService();