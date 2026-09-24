// lib/api/scans.ts
import { apiClient } from "./client";
import type {
  ScanResultData,
  ScanSummaryGroup,
} from "@/components/events/types";

// ── Payload shape returned by POST .../registration-data/scan/:categoryId
interface ScanPayload {
  scan: any;
  registration: { _id: string; regNum: string; name: string };
  regDataType: { _id: string; regDataTypeName: string };
  category: {
    _id: string;
    categoryCode: string;
    categoryName: string;
    status: string;
    groupCategoryId: string;
  };
  isAllowed: boolean;
  isScanned: boolean;
  scannedAt: string;
}

// ── Payload shape returned by GET .../registration-scans
export interface RegistrationScanItem {
  _id: string;
  registrationDataId: {
    _id: string;
    regNum: string;
    name: string;
    email?: string;
    mobile?: string;
  } | null;
  categoryId: {
    _id: string;
    categoryCode?: string;
    categoryName?: string;
    status?: string;
    groupCategoryId?: string;
  } | null;
  scannedAt: string;
  isScanned: boolean;
}

export const registrationScanApi = {
  // ── Scan a registration number into a category
  async scan(
    eventId: string,
    categoryId: string,
    regNum: string,
  ): Promise<ScanResultData> {
    const res = await apiClient.post<ScanPayload>(
      `/api/events/${eventId}/registration-data/scan/${categoryId}`,
      { regNum },
    );

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || "Empty scan response from server.");
    }

    return res.data as unknown as ScanResultData;
  },

  // ── Aggregate summary per group / category (used for the category cards)
  async summary(eventId: string): Promise<ScanSummaryGroup[]> {
    const res = await apiClient.get<ScanSummaryGroup[]>(
      `/api/events/${eventId}/registration-scan/summary`,
    );

    if (!res || !res.success || !res.data) {
      return [];
    }
    return res.data;
  },

  // ── Every individual scan for the event (used to rebuild state on refresh)
  async list(
    eventId: string,
    params?: { page?: number; limit?: number },
  ): Promise<RegistrationScanItem[]> {
    const qp = new URLSearchParams();
    qp.append("limit", String(params?.limit ?? 1000));
    if (params?.page) qp.append("page", String(params.page));

    const url = `/api/events/${eventId}/registration-scans?${qp.toString()}`;
    const res = await apiClient.get<RegistrationScanItem[]>(url);

    if (!res || !res.success || !res.data) return [];
    return res.data;
  },
};
