// Authentication service for login, register, and logout operations

import { BaseApiService, TokenManager } from './api';
import type { User, LoginCredentials, RegisterData } from '../types';

export class AuthService extends BaseApiService {
  private currentUser: User | null = null;

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<User> {
    // Mock login for development - remove when backend is ready
    if (credentials.username === 'test_user' && credentials.password === 'test123') {
      const mockUser: User = {
        id: 1,
        username: 'test_user',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store mock token
      TokenManager.setToken('mock_token_12345');
      
      // Store user data
      this.currentUser = mockUser;
      
      return mockUser;
    } else {
      throw new Error('Geçersiz kullanıcı adı veya şifre');
    }

    // Real implementation (commented out until backend is ready)
    /*
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Store tokens
    TokenManager.setToken(response.access_token);
    
    // Store user data
    this.currentUser = response.user;
    
    return response.user;
    */
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<User> {
    // Mock register for development - remove when backend is ready
    if (userData.username && userData.email && userData.password) {
      const mockUser: User = {
        id: 2,
        username: userData.username,
        email: userData.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store mock token
      TokenManager.setToken('mock_token_register_67890');
      
      // Store user data
      this.currentUser = mockUser;
      
      return mockUser;
    } else {
      throw new Error('Tüm alanlar gereklidir');
    }

    // Real implementation (commented out until backend is ready)
    /*
    const response = await this.post<AuthResponse>('/auth/register', userData);

    // Store tokens
    TokenManager.setToken(response.access_token);
    
    // Store user data
    this.currentUser = response.user;
    
    return response.user;
    */
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if it exists
      await this.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
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
    // Mock profile for development - remove when backend is ready
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // If we have a token but no current user, create a mock user
    const token = TokenManager.getToken();
    if (token) {
      const mockUser: User = {
        id: 1,
        username: 'test_user',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.currentUser = mockUser;
      return mockUser;
    }
    
    throw new Error('Kullanıcı oturumu bulunamadı');

    // Real implementation (commented out until backend is ready)
    /*
    const user = await this.get<User>('/auth/me');
    this.currentUser = user;
    return user;
    */
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