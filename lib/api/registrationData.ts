// lib/api/registrationData.ts
import { apiClient } from "./client";
import type { PrintUser, RegDataType } from "@/components/events/types";

// ============================================
// Backend Response Types (exact match)
// ============================================
export interface BackendRegistrationData {
  _id: string;
  eventId: string | { _id: string; eventName: string; eventShortName: string };
  regDataTypeId: string | { _id: string; regDataTypeName: string };
  name: string;
  regNum: string;
  email?: string;
  mobile?: string;
  mciNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  reference?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Request Payload Types
// ============================================
export interface CreateRegistrationDataPayload {
  regDataTypeId: string;
  name: string;
  email?: string;
  mobile?: string;
  mciNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  reference?: string;
  note?: string;
}

export interface UpdateRegistrationDataPayload {
  regDataTypeId?: string;
  name?: string;
  email?: string;
  mobile?: string;
  mciNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  reference?: string;
  note?: string;
}

export interface ImportResult {
  importedCount: number;
}

// ============================================
// Adapters — inline, no separate file
// ============================================

// Helper — unwrap populated ObjectId refs
const unwrapId = (value: any): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) return String(value._id);
  return String(value);
};

// Backend → Frontend
export function toPrintUser(
  r: BackendRegistrationData,
  userTypes: RegDataType[],
): PrintUser {
  const userTypeId = unwrapId(r.regDataTypeId);
  const userTypeName =
    typeof r.regDataTypeId === "object"
      ? r.regDataTypeId.regDataTypeName
      : userTypes.find((ut) => ut._id === userTypeId)?.regDataTypeName || "";

  return {
    id: r._id,
    registrationNo: r.regNum,
    userTypeId,
    userTypeName,
    email: r.email || "",
    fullName: r.name,
    phone: r.mobile || "",
    imcNumber: r.mciNumber,
    note: r.note,
    reference: r.reference,
    address: r.address,
    city: r.city,
    state: r.state,
    country: r.country,
    printed: false,
  };
}

// Frontend → Backend (create)
export function toCreatePayload(
  u: Omit<PrintUser, "id" | "printed" | "userTypeName">,
): CreateRegistrationDataPayload {
  return {
    regDataTypeId: u.userTypeId,
    name: u.fullName,
    email: u.email || undefined,
    mobile: u.phone || undefined,
    mciNumber: u.imcNumber || undefined,
    address: u.address || undefined,
    city: u.city || undefined,
    state: u.state || undefined,
    country: u.country || undefined,
    reference: u.reference || undefined,
    note: u.note || undefined,
  };
}

// Frontend → Backend (update)
export function toUpdatePayload(
  u: Partial<PrintUser>,
): UpdateRegistrationDataPayload {
  const payload: UpdateRegistrationDataPayload = {};
  if (u.userTypeId !== undefined) payload.regDataTypeId = u.userTypeId;
  if (u.fullName !== undefined) payload.name = u.fullName;
  if (u.email !== undefined) payload.email = u.email;
  if (u.phone !== undefined) payload.mobile = u.phone;
  if (u.imcNumber !== undefined) payload.mciNumber = u.imcNumber;
  if (u.address !== undefined) payload.address = u.address;
  if (u.city !== undefined) payload.city = u.city;
  if (u.state !== undefined) payload.state = u.state;
  if (u.country !== undefined) payload.country = u.country;
  if (u.reference !== undefined) payload.reference = u.reference;
  if (u.note !== undefined) payload.note = u.note;
  return payload;
}

// ============================================
// API Service
// ============================================
export const registrationDataApi = {
  async getRegistrationData(
    eventId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<BackendRegistrationData[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/api/events/${eventId}/registration-data${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<BackendRegistrationData[]>(url);
    if (response.success && response.data) return response.data;
    throw new Error(response.message || "Failed to fetch registration data");
  },

  async getRegistrationDataById(
    eventId: string,
    id: string,
  ): Promise<BackendRegistrationData> {
    const response = await apiClient.get<BackendRegistrationData>(
      `/api/events/${eventId}/registration-data/${id}`,
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message || "Failed to fetch registration data");
  },

  async createRegistrationData(
    eventId: string,
    data: CreateRegistrationDataPayload,
  ): Promise<BackendRegistrationData> {
    const response = await apiClient.post<BackendRegistrationData>(
      `/api/events/${eventId}/registration-data`,
      data,
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message || "Failed to create registration data");
  },

  async updateRegistrationData(
    eventId: string,
    id: string,
    data: UpdateRegistrationDataPayload,
  ): Promise<BackendRegistrationData> {
    const response = await apiClient.patch<BackendRegistrationData>(
      `/api/events/${eventId}/registration-data/${id}`,
      data,
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message || "Failed to update registration data");
  },

  async deleteRegistrationData(eventId: string, id: string): Promise<void> {
    const response = await apiClient.delete(
      `/api/events/${eventId}/registration-data/${id}`,
    );
    if (!response.success) {
      throw new Error(response.message || "Failed to delete registration data");
    }
  },

  async deleteAllRegistrationData(
    eventId: string,
  ): Promise<{ deletedCount: number }> {
    const response = await apiClient.delete<{ deletedCount: number }>(
      `/api/events/${eventId}/registration-data`,
    );
    if (response.success && response.data) return response.data;
    if (response.success) return { deletedCount: 0 };
    throw new Error(response.message || "Failed to delete all");
  },

  async importRegistrationData(
    eventId: string,
    regDataTypeId: string,
    file: File,
  ): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("regDataTypeId", regDataTypeId);
    formData.append("file", file);

    const response = await apiClient.post<ImportResult>(
      `/api/events/${eventId}/registration-data/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    if (response.success && response.data) return response.data;
    if (response.success) return { importedCount: 0 };
    throw new Error(response.message || "Failed to import registration data");
  },
};
