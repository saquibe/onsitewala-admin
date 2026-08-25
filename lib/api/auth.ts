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
  profileImage?: string;
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

export interface UpdateProfileRequest {
  fullName?: string;
  mobile?: string;
  profileImage?: File | string;
}

export const authApi = {
  // Login
  async login(
    data: LoginRequest,
  ): Promise<{ user: User; accessToken: string }> {
    try {
      console.log("Login attempt with:", { email: data.email });
      const response = await apiClient.post<LoginResponse>(
        "/api/auth/login",
        data,
      );
      console.log("Login response:", response);

      if (response.success && response.data) {
        apiClient.setToken(response.data.accessToken);
        return {
          user: response.data.user,
          accessToken: response.data.accessToken,
        };
      }
      throw new Error(response.message || "Login failed");
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Refresh token
  async refreshToken(): Promise<string> {
    try {
      const response =
        await apiClient.post<RefreshTokenResponse>("/api/auth/refresh");
      if (response.success && response.data) {
        const newToken = response.data.accessToken;
        apiClient.setToken(newToken);
        return newToken;
      }
      throw new Error(response.message || "Token refresh failed");
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      apiClient.clearToken();
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>("/api/auth/me");
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to get user profile");
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post("/api/auth/forgot-password", data);
      if (!response.success) {
        throw new Error(response.message || "Forgot password request failed");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post("/api/auth/reset-password", data);
      if (!response.success) {
        throw new Error(response.message || "Password reset failed");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  // Update profile - handles all updates (name, mobile, image) in one request
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const formData = new FormData();

      // Only append fields that are provided
      if (data.fullName !== undefined) {
        formData.append("fullName", data.fullName);
      }

      if (data.mobile !== undefined) {
        formData.append("mobile", data.mobile);
      }

      // Handle profile image - only append if it's a File object or empty string
      if (data.profileImage instanceof File) {
        formData.append("profileImage", data.profileImage);
      } else if (data.profileImage === "") {
        // To remove image, send empty string (backend will handle this)
        formData.append("profileImage", "");
      }
      // If profileImage is a string URL, we don't need to send it again

      console.log("Updating profile with:", {
        fullName: data.fullName,
        mobile: data.mobile,
        hasImageFile: data.profileImage instanceof File,
        imageType:
          data.profileImage instanceof File
            ? data.profileImage.type
            : typeof data.profileImage,
      });

      const response = await apiClient.patch<User>(
        "/api/auth/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Profile update failed");
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },
};
