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
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

    console.log("API Client initialized with baseURL:", baseURL);

    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    // Request interceptor for adding token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(
          `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        );
        return config;
      },
      (error) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        console.error("API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        });

        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await this.refreshToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              // Don't redirect here, let the component handle it
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
        "api/auth/refresh",
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
    try {
      const response = await this.client.post<ApiResponse<T>>(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      console.error("POST Error:", error);
      throw error;
    }
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      console.error("PATCH Error:", error);
      throw error;
    }
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

  public getBaseURL(): string {
    return this.client.defaults.baseURL || "";
  }
}

export const apiClient = ApiClient.getInstance();
