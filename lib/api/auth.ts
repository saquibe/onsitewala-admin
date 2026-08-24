// lib/api/auth.ts
import { apiClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authApi = {
  // Login
  async login(
    data: LoginRequest,
  ): Promise<{ user: User; accessToken: string }> {
    const response = await apiClient.post<LoginResponse>(
      "api/auth/login",
      data,
    );
    if (response.success && response.data) {
      apiClient.setToken(response.data.accessToken);
      return {
        user: response.data.user,
        accessToken: response.data.accessToken,
      };
    }
    throw new Error(response.message || "Login failed");
  },

  // Refresh token
  async refreshToken(): Promise<string> {
    const response =
      await apiClient.post<RefreshTokenResponse>("api/auth/refresh");
    if (response.success && response.data) {
      const newToken = response.data.accessToken;
      apiClient.setToken(newToken);
      return newToken;
    }
    throw new Error(response.message || "Token refresh failed");
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post("api/auth/logout");
    } catch (error) {
      // Even if API fails, clear token
      console.error("Logout API error:", error);
    } finally {
      apiClient.clearToken();
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("api/auth/me");
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Failed to get user profile");
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const response = await apiClient.post("api/auth/forgot-password", data);
    if (!response.success) {
      throw new Error(response.message || "Forgot password request failed");
    }
  },

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const response = await apiClient.post("api/auth/reset-password", data);
    if (!response.success) {
      throw new Error(response.message || "Password reset failed");
    }
  },
};
