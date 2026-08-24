// lib/api/events.ts
import { apiClient } from "./client";

export interface Event {
  id: string;
  fullName: string;
  shortName: string;
  operatorLoginCode: string;
  organizerId: string;
  startDate: string;
  endDate: string;
  venueId: string;
  image: string;
  city: string;
  state: string;
  country: string;
  status: string;
}

export const eventsApi = {
  async getEvents(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>("/events");
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch events");
  },

  async getEvent(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch event");
  },

  // Add more CRUD operations as needed
};
