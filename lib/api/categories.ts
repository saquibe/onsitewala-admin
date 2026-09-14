// lib/api/categories.ts
import { apiClient } from "./client";
import type {
  Category,
  CategoryGroup,
  RegDataType,
} from "@/components/events/types";

// ============================================
// Helper — unwrap populated ObjectId references
// ============================================
const unwrapId = (value: any): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) return String(value._id);
  return String(value);
};

// ============================================
// Categories API
// ============================================
export const categoriesApi = {
  async createCategory(
    eventId: string,
    data: {
      categoryCode: string;
      categoryName: string;
      groupCategoryId: string;
      status?: "active" | "inactive";
      day?: string;
      hall?: string;
      session?: string;
      time?: string;
    },
  ): Promise<Category> {
    const response = await apiClient.post<any>(
      `/api/events/${eventId}/categories`,
      data,
    );
    if (response.success && response.data) {
      // Normalize populated refs
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
        groupCategoryId: unwrapId(response.data.groupCategoryId),
      };
    }
    throw new Error(response.message || "Failed to create category");
  },

  async getCategories(
    eventId: string,
    params?: { page?: number; limit?: number; search?: string },
  ): Promise<Category[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/api/events/${eventId}/categories${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<any[]>(url);
    if (response.success && response.data) {
      return response.data.map((c: any) => ({
        ...c,
        eventId: unwrapId(c.eventId),
        groupCategoryId: unwrapId(c.groupCategoryId),
      }));
    }
    throw new Error(response.message || "Failed to fetch categories");
  },

  async getActiveCategories(
    eventId: string,
    params?: { page?: number; limit?: number; search?: string },
  ): Promise<Category[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/api/events/${eventId}/categories/active${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<any[]>(url);
    if (response.success && response.data) {
      return response.data.map((c: any) => ({
        ...c,
        eventId: unwrapId(c.eventId),
        groupCategoryId: unwrapId(c.groupCategoryId),
      }));
    }
    throw new Error(response.message || "Failed to fetch active categories");
  },

  async getCategoryById(eventId: string, id: string): Promise<Category> {
    const response = await apiClient.get<any>(
      `/api/events/${eventId}/categories/${id}`,
    );
    if (response.success && response.data) {
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
        groupCategoryId: unwrapId(response.data.groupCategoryId),
      };
    }
    throw new Error(response.message || "Failed to fetch category");
  },

  async updateCategory(
    eventId: string,
    id: string,
    data: Partial<{
      categoryCode: string;
      categoryName: string;
      groupCategoryId: string;
      status: "active" | "inactive";
      day?: string;
      hall?: string;
      session?: string;
      time?: string;
    }>,
  ): Promise<Category> {
    const response = await apiClient.patch<any>(
      `/api/events/${eventId}/categories/${id}`,
      data,
    );
    if (response.success && response.data) {
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
        groupCategoryId: unwrapId(response.data.groupCategoryId),
      };
    }
    throw new Error(response.message || "Failed to update category");
  },

  async deleteCategory(eventId: string, id: string): Promise<void> {
    const response = await apiClient.delete(
      `/api/events/${eventId}/categories/${id}`,
    );
    if (!response.success) {
      throw new Error(response.message || "Failed to delete category");
    }
  },
};

// ============================================
// Group Categories API
// ============================================
export const groupCategoriesApi = {
  async createGroupCategory(
    eventId: string,
    data: { groupCategoryName: string; description?: string },
  ): Promise<CategoryGroup> {
    const response = await apiClient.post<any>(
      `/api/events/${eventId}/group-categories`,
      data,
    );
    if (response.success && response.data) {
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
      };
    }
    throw new Error(response.message || "Failed to create group category");
  },

  async getGroupCategories(
    eventId: string,
    params?: { page?: number; limit?: number; search?: string },
  ): Promise<CategoryGroup[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/api/events/${eventId}/group-categories${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<any[]>(url);
    if (response.success && response.data) {
      return response.data.map((g: any) => ({
        ...g,
        eventId: unwrapId(g.eventId),
      }));
    }
    throw new Error(response.message || "Failed to fetch group categories");
  },

  async getGroupCategoryById(
    eventId: string,
    id: string,
  ): Promise<CategoryGroup> {
    const response = await apiClient.get<any>(
      `/api/events/${eventId}/group-categories/${id}`,
    );
    if (response.success && response.data) {
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
      };
    }
    throw new Error(response.message || "Failed to fetch group category");
  },

  async updateGroupCategory(
    eventId: string,
    id: string,
    data: { groupCategoryName?: string; description?: string },
  ): Promise<CategoryGroup> {
    const response = await apiClient.patch<any>(
      `/api/events/${eventId}/group-categories/${id}`,
      data,
    );
    if (response.success && response.data) {
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
      };
    }
    throw new Error(response.message || "Failed to update group category");
  },

  async deleteGroupCategory(eventId: string, id: string): Promise<void> {
    const response = await apiClient.delete(
      `/api/events/${eventId}/group-categories/${id}`,
    );
    if (!response.success) {
      throw new Error(response.message || "Failed to delete group category");
    }
  },
};

// ============================================
// Reg Data Types API
// ============================================
export const regDataTypesApi = {
  async createRegDataType(
    eventId: string,
    data: { regDataTypeName: string },
  ): Promise<RegDataType | null> {
    const response = await apiClient.post<any>(
      `/api/events/${eventId}/reg-data-types`,
      data,
    );
    if (response.success) {
      if (!response.data) return null; // backend sometimes returns null
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
      };
    }
    throw new Error(response.message || "Failed to create reg data type");
  },

  async getRegDataTypes(
    eventId: string,
    params?: { page?: number; limit?: number; search?: string },
  ): Promise<RegDataType[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/api/events/${eventId}/reg-data-types${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<any[]>(url);
    if (response.success && response.data) {
      return response.data.map((r: any) => ({
        ...r,
        eventId: unwrapId(r.eventId),
      }));
    }
    throw new Error(response.message || "Failed to fetch reg data types");
  },

  async updateRegDataType(
    eventId: string,
    id: string,
    data: { regDataTypeName?: string },
  ): Promise<RegDataType> {
    const response = await apiClient.patch<any>(
      `/api/events/${eventId}/reg-data-types/${id}`,
      data,
    );
    if (response.success && response.data) {
      return {
        ...response.data,
        eventId: unwrapId(response.data.eventId),
      };
    }
    throw new Error(response.message || "Failed to update reg data type");
  },

  async deleteRegDataType(eventId: string, id: string): Promise<void> {
    const response = await apiClient.delete(
      `/api/events/${eventId}/reg-data-types/${id}`,
    );
    if (!response.success) {
      throw new Error(response.message || "Failed to delete reg data type");
    }
  },
};
