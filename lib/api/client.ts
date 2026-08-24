// lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors: any | null;
}

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for adding token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await this.refreshToken();
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            };
            return this.client(originalRequest);
          } catch (refreshError) {
            // Redirect to login on refresh failure
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              window.location.href = "/";
            }
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async refreshToken(): Promise<string> {
    const response =
      await this.client.post<ApiResponse<{ accessToken: string }>>(
        "/auth/refresh",
      );
    if (response.data.success && response.data.data) {
      const newToken = response.data.data.accessToken;
      localStorage.setItem("accessToken", newToken);
      return newToken;
    }
    throw new Error("Failed to refresh token");
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  public setToken(token: string) {
    localStorage.setItem("accessToken", token);
  }

  public clearToken() {
    localStorage.removeItem("accessToken");
  }
}

export const apiClient = ApiClient.getInstance();
