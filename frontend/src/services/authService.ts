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
      // Backend login implementation
      const loginData = {
        email: credentials.email,
        password: credentials.password
      };

      const response = await this.post<{
        access_token: string;
        token_type: string;
        user: User;
      }>('/auth/login', loginData);

      // Store tokens
      TokenManager.setToken(response.access_token);
      
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
      }>('/auth/register', registerData);

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
      await this.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear local data
      TokenManager.removeToken();
      this.currentUser = null;
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
      const user = await this.get<User>('/auth/me');
      this.currentUser = user;
      return user;
    } catch (error: any) {
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
    const updatedUser = await this.put<User>('/auth/me', userData);
    this.currentUser = updatedUser;
    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await this.post('/auth/verify-email', { token });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    await this.post('/auth/resend-verification');
  }
}

// Create and export singleton instance
export const authService = new AuthService();