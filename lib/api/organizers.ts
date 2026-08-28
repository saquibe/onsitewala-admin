// lib/api/organizers.ts
import { apiClient } from "./client";
import { PaginatedResponse } from "./venues";

export interface Organizer {
  _id: string;
  organizerName: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonMobile: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrganizerRequest {
  organizerName: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonMobile: string;
}

export interface UpdateOrganizerRequest {
  organizerName?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonMobile?: string;
}

export const organizersApi = {
  // Get all organizers
  async getOrganizers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<PaginatedResponse<Organizer>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `/api/organizers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<PaginatedResponse<Organizer>>(url);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch organizers");
    } catch (error) {
      console.error("Get organizers error:", error);
      throw error;
    }
  },

  // Get organizer by ID
  async getOrganizerById(id: string): Promise<Organizer> {
    try {
      const response = await apiClient.get<Organizer>(`/api/organizers/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch organizer");
    } catch (error) {
      console.error("Get organizer by ID error:", error);
      throw error;
    }
  },

  // Create organizer
  async createOrganizer(data: CreateOrganizerRequest): Promise<Organizer> {
    try {
      const response = await apiClient.post<Organizer>("/api/organizers", data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to create organizer");
    } catch (error) {
      console.error("Create organizer error:", error);
      throw error;
    }
  },

  // Update organizer
  async updateOrganizer(
    id: string,
    data: UpdateOrganizerRequest,
  ): Promise<Organizer> {
    try {
      const response = await apiClient.patch<Organizer>(
        `/api/organizers/${id}`,
        data,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to update organizer");
    } catch (error) {
      console.error("Update organizer error:", error);
      throw error;
    }
  },

  // Delete organizer
  async deleteOrganizer(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/api/organizers/${id}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete organizer");
      }
    } catch (error) {
      console.error("Delete organizer error:", error);
      throw error;
    }
  },
};
