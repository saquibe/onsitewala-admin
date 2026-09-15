// lib/api/privileges.ts
import { apiClient } from "./client";

// ============================================
// Privilege Types
// ============================================
export interface Privilege {
  _id: string;
  eventId: string;
  regDataTypeId: string;
  categoryId: string;
  isAllowed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrivilegeMatrix {
  regDataTypes: Array<{
    _id: string;
    regDataTypeName: string;
  }>;
  categories: Array<{
    _id: string;
    categoryCode: string;
    categoryName: string;
    status: string;
  }>;
  privileges: Array<{
    _id: string;
    regDataTypeId: string;
    categoryId: string;
    isAllowed: boolean;
  }>;
}

// Helper to unwrap populated ObjectId refs
const unwrapId = (value: any): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) return String(value._id);
  return String(value);
};

// ============================================
// Privileges API
// ============================================
export const privilegesApi = {
  // Create privilege
  async createPrivilege(
    eventId: string,
    data: {
      regDataTypeId: string;
      categoryId: string;
      isAllowed: boolean;
    },
  ): Promise<Privilege> {
    const response = await apiClient.post<any>(
      `/api/events/${eventId}/privileges`,
      data,
    );
    if (response.success && response.data) {
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
        regDataTypeId: unwrapId(response.data.regDataTypeId),
        categoryId: unwrapId(response.data.categoryId),
      };
    }
    throw new Error(response.message || "Failed to create privilege");
  },

  // Get all privileges
  async getPrivileges(
    eventId: string,
    params?: { page?: number; limit?: number },
  ): Promise<Privilege[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `/api/events/${eventId}/privileges${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<any[]>(url);
    if (response.success && response.data) {
      return response.data.map((p: any) => ({
        ...p,
        eventId: unwrapId(p.eventId),
        regDataTypeId: unwrapId(p.regDataTypeId),
        categoryId: unwrapId(p.categoryId),
      }));
    }
    throw new Error(response.message || "Failed to fetch privileges");
  },

  // Get privilege matrix (regDataTypes + categories + privileges)
  async getPrivilegeMatrix(eventId: string): Promise<PrivilegeMatrix> {
    const response = await apiClient.get<PrivilegeMatrix>(
      `/api/events/${eventId}/privileges/matrix`,
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch privilege matrix");
  },

  // Get privilege by ID
  async getPrivilegeById(eventId: string, id: string): Promise<Privilege> {
    const response = await apiClient.get<any>(
      `/api/events/${eventId}/privileges/${id}`,
    );
    if (response.success && response.data) {
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
        regDataTypeId: unwrapId(response.data.regDataTypeId),
        categoryId: unwrapId(response.data.categoryId),
      };
    }
    throw new Error(response.message || "Failed to fetch privilege");
  },

  // Update privilege by ID
  async updatePrivilege(
    eventId: string,
    id: string,
    data: {
      regDataTypeId?: string;
      categoryId?: string;
      isAllowed?: boolean;
    },
  ): Promise<Privilege> {
    const response = await apiClient.patch<any>(
      `/api/events/${eventId}/privileges/${id}`,
      data,
    );
    if (response.success && response.data) {
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
        regDataTypeId: unwrapId(response.data.regDataTypeId),
        categoryId: unwrapId(response.data.categoryId),
      };
    }
    throw new Error(response.message || "Failed to update privilege");
  },

  // Delete privilege
  async deletePrivilege(eventId: string, id: string): Promise<void> {
    const response = await apiClient.delete(
      `/api/events/${eventId}/privileges/${id}`,
    );
    if (!response.success) {
      throw new Error(response.message || "Failed to delete privilege");
    }
  },

  // Allow all categories for a reg data type
  async allowAllCategories(
    eventId: string,
    regDataTypeId: string,
  ): Promise<void> {
    const response = await apiClient.patch(
      `/api/events/${eventId}/privileges/reg-data-types/${regDataTypeId}/allow-all`,
      {},
    );
    if (!response.success) {
      throw new Error(response.message || "Failed to allow all");
    }
  },

  // Block all categories for a reg data type
  async blockAllCategories(
    eventId: string,
    regDataTypeId: string,
  ): Promise<void> {
    const response = await apiClient.patch(
      `/api/events/${eventId}/privileges/reg-data-types/${regDataTypeId}/block-all`,
      {},
    );
    if (!response.success) {
      throw new Error(response.message || "Failed to block all");
    }
  },
};
