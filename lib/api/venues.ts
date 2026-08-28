// lib/api/venues.ts
import { apiClient } from "./client";

export interface Venue {
  _id: string;
  venueName: string;
  country: string;
  state: string;
  city: string;
  address: string;
  website: string;
  mapLink: string;
  uploadVenuePhoto: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVenueRequest {
  venueName: string;
  country: string;
  state: string;
  city: string;
  address: string;
  website: string;
  mapLink: string;
  uploadVenuePhoto?: File;
}

export interface UpdateVenueRequest {
  venueName?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  website?: string;
  mapLink?: string;
  uploadVenuePhoto?: File | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const venuesApi = {
  // Get all venues
  async getVenues(params?: {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
    state?: string;
    city?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<PaginatedResponse<Venue>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.country) queryParams.append("country", params.country);
      if (params?.state) queryParams.append("state", params.state);
      if (params?.city) queryParams.append("city", params.city);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `/api/venues${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<PaginatedResponse<Venue>>(url);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch venues");
    } catch (error) {
      console.error("Get venues error:", error);
      throw error;
    }
  },

  // Get venue by ID
  async getVenueById(id: string): Promise<Venue> {
    try {
      const response = await apiClient.get<Venue>(`/api/venues/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch venue");
    } catch (error) {
      console.error("Get venue by ID error:", error);
      throw error;
    }
  },

  // Create venue
  async createVenue(data: CreateVenueRequest): Promise<Venue> {
    try {
      const formData = new FormData();
      formData.append("venueName", data.venueName);
      formData.append("country", data.country);
      formData.append("state", data.state);
      formData.append("city", data.city);
      formData.append("address", data.address);
      formData.append("website", data.website);
      formData.append("mapLink", data.mapLink);

      if (data.uploadVenuePhoto) {
        formData.append("uploadVenuePhoto", data.uploadVenuePhoto);
      }

      const response = await apiClient.post<Venue>("/api/venues", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to create venue");
    } catch (error) {
      console.error("Create venue error:", error);
      throw error;
    }
  },

  // Update venue
  async updateVenue(id: string, data: UpdateVenueRequest): Promise<Venue> {
    try {
      const hasFile = data.uploadVenuePhoto instanceof File;

      // If no file, send as JSON
      if (!hasFile) {
        const response = await apiClient.patch<Venue>(`/api/venues/${id}`, {
          venueName: data.venueName,
          country: data.country,
          state: data.state,
          city: data.city,
          address: data.address,
          website: data.website,
          mapLink: data.mapLink,
        });

        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || "Failed to update venue");
      }

      // If file exists, use FormData
      const formData = new FormData();
      if (data.venueName) formData.append("venueName", data.venueName);
      if (data.country) formData.append("country", data.country);
      if (data.state) formData.append("state", data.state);
      if (data.city) formData.append("city", data.city);
      if (data.address) formData.append("address", data.address);
      if (data.website) formData.append("website", data.website);
      if (data.mapLink) formData.append("mapLink", data.mapLink);
      if (data.uploadVenuePhoto instanceof File) {
        formData.append("uploadVenuePhoto", data.uploadVenuePhoto);
      }

      const response = await apiClient.patch<Venue>(
        `/api/venues/${id}`,
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
      throw new Error(response.message || "Failed to update venue");
    } catch (error) {
      console.error("Update venue error:", error);
      throw error;
    }
  },

  // Delete venue
  async deleteVenue(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/api/venues/${id}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete venue");
      }
    } catch (error) {
      console.error("Delete venue error:", error);
      throw error;
    }
  },
};
