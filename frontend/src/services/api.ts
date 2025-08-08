// Base API client with Axios configuration and interceptors

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { ApiError, ApiErrorResponse } from '../types';
import { config } from '../config/environment';

// Base API configuration (use environment config for consistency)
const API_BASE_URL = config.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// Removed timeout to prevent timeout errors on long-running operations
// const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // timeout: API_TIMEOUT, // Removed timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
class TokenManager {
  private static readonly TOKEN_KEY = 'eduai_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'eduai_refresh_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }
}

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token (if refresh endpoint exists)
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          // If backend does not implement refresh, fall back to hard logout
          // const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
          // const { access_token } = response.data;
          // TokenManager.setToken(access_token);
          // if (originalRequest.headers) {
          //   originalRequest.headers.Authorization = `Bearer ${access_token}`;
          // }
          // return apiClient(originalRequest);

          // Hard logout fallback
          TokenManager.removeToken();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        TokenManager.removeToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Transform error to our ApiError format
    const apiError: ApiError = {
      message: 'An error occurred',
      status: error.response?.status || 500,
    };

    if (error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      
      if (typeof errorData.detail === 'string') {
        apiError.message = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        // Handle validation errors
        apiError.message = errorData.detail.map(err => err.message).join(', ');
        apiError.details = { validation_errors: errorData.detail };
      }
    } else if (error.message) {
      apiError.message = error.message;
    }

    return Promise.reject(apiError);
  }
);

// Retry logic for network errors
const retryRequest = async (
  requestFn: () => Promise<AxiosResponse>,
  retries: number = MAX_RETRIES
): Promise<AxiosResponse> => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, MAX_RETRIES - retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

// Check if error is retryable (network errors, 5xx errors)
const isRetryableError = (error: any): boolean => {
  if (!error.response) {
    // Network error
    return true;
  }
  
  const status = error.response.status;
  // Retry on 5xx server errors, but not on 4xx client errors
  return status >= 500 && status < 600;
};

// Base API service class
export class BaseApiService {
  protected client = apiClient;

  // GET request with retry logic
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await retryRequest(() => this.client.get<T>(url, config));
      return response.data;
    } catch (error) {
      console.error('BaseApiService.get error:', error);
      throw error;
    }
  }

  // POST request with retry logic
  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await retryRequest(() => this.client.post<T>(url, data, config));
    return response.data;
  }

  // PUT request with retry logic
  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await retryRequest(() => this.client.put<T>(url, data, config));
    return response.data;
  }

  // DELETE request with retry logic
  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await retryRequest(() => this.client.delete<T>(url, config));
    return response.data;
  }

  // PATCH request with retry logic
  protected async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await retryRequest(() => this.client.patch<T>(url, data, config));
    return response.data;
  }
}

// Export token manager for use in other services
export { TokenManager };

// Export the configured axios instance for direct use if needed
export default apiClient;