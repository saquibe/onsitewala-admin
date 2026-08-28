// lib/api/events.ts
import { apiClient } from "./client";
import { PaginatedResponse, Venue } from "./venues";
import { Organizer } from "./organizers";

export interface Event {
  _id: string;
  eventName: string;
  eventShortName: string;
  operatorLoginCode: string;
  organizerId: string | Organizer;
  venueId: string | Venue;
  startDate: string;
  endDate: string;
  uploadEventLogo: string | null;
  dynamicStatus?: "Upcoming" | "Live" | "Past";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventRequest {
  eventName: string;
  eventShortName: string;
  operatorLoginCode: string;
  organizerId: string;
  venueId: string;
  startDate: string;
  endDate: string;
  uploadEventLogo?: File;
}

export interface UpdateEventRequest {
  eventName?: string;
  eventShortName?: string;
  operatorLoginCode?: string;
  organizerId?: string;
  venueId?: string;
  startDate?: string;
  endDate?: string;
  uploadEventLogo?: File | string;
}

export const eventsApi = {
  // Get all events
  async getEvents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    organizerId?: string;
    venueId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<PaginatedResponse<Event>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.organizerId)
        queryParams.append("organizerId", params.organizerId);
      if (params?.venueId) queryParams.append("venueId", params.venueId);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<PaginatedResponse<Event>>(url);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch events");
    } catch (error) {
      console.error("Get events error:", error);
      throw error;
    }
  },

  // Get event by ID
  async getEventById(id: string): Promise<Event> {
    try {
      const response = await apiClient.get<Event>(`/api/events/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch event");
    } catch (error) {
      console.error("Get event by ID error:", error);
      throw error;
    }
  },

  // Create event
  async createEvent(data: CreateEventRequest): Promise<Event> {
    try {
      const formData = new FormData();
      formData.append("eventName", data.eventName);
      formData.append("eventShortName", data.eventShortName);
      formData.append("operatorLoginCode", data.operatorLoginCode);
      formData.append("organizerId", data.organizerId);
      formData.append("venueId", data.venueId);
      formData.append("startDate", data.startDate);
      formData.append("endDate", data.endDate);

      if (data.uploadEventLogo) {
        formData.append("uploadEventLogo", data.uploadEventLogo);
      }

      const response = await apiClient.post<Event>("/api/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to create event");
    } catch (error) {
      console.error("Create event error:", error);
      throw error;
    }
  },

  // Update event
  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    try {
      const hasFile = data.uploadEventLogo instanceof File;

      // If no file, send as JSON
      if (!hasFile) {
        const response = await apiClient.patch<Event>(`/api/events/${id}`, {
          eventName: data.eventName,
          eventShortName: data.eventShortName,
          operatorLoginCode: data.operatorLoginCode,
          organizerId: data.organizerId,
          venueId: data.venueId,
          startDate: data.startDate,
          endDate: data.endDate,
        });

        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || "Failed to update event");
      }

      // If file exists, use FormData
      const formData = new FormData();
      if (data.eventName) formData.append("eventName", data.eventName);
      if (data.eventShortName)
        formData.append("eventShortName", data.eventShortName);
      if (data.operatorLoginCode)
        formData.append("operatorLoginCode", data.operatorLoginCode);
      if (data.organizerId) formData.append("organizerId", data.organizerId);
      if (data.venueId) formData.append("venueId", data.venueId);
      if (data.startDate) formData.append("startDate", data.startDate);
      if (data.endDate) formData.append("endDate", data.endDate);
      if (data.uploadEventLogo instanceof File) {
        formData.append("uploadEventLogo", data.uploadEventLogo);
      }

      const response = await apiClient.patch<Event>(
        `/api/events/${id}`,
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
      throw new Error(response.message || "Failed to update event");
    } catch (error) {
      console.error("Update event error:", error);
      throw error;
    }
  },

  // Delete event
  async deleteEvent(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/api/events/${id}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Delete event error:", error);
      throw error;
    }
  },
};
