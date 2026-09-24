// lib/api/dashboard.ts
import { apiClient } from "./client";

export interface DashboardStats {
  stats: {
    totalAttendees: number;
    badgesPrinted: number;
    badgesNotPrinted: number;
    printCoverage: number;
    scansTotal: number;
    scansToday: number;
    categories: number;
  };
  usersByType: Array<{ type: string; total: number; printed: number }>;
  dayWisePrinted: Array<Record<string, string | number>>;
  dayWiseTotal: Array<Record<string, string | number>>;
  scanActivity: Array<{ hour: string; scans: number }>;
  scansByGroup: Array<{
    groupName: string;
    categories: Array<{
      categoryName: string;
      scanned: number;
      total: number;
    }>;
  }>;
  dataQuality: {
    missingEmail: number;
    missingPhone: number;
    missingImc: number;
  };
}

export interface RecentScan {
  _id: string;
  regNum: string;
  name: string;
  category: string;
  scannedAt: string;
}

export const dashboardApi = {
  async getStats(eventId: string): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>(
      `/api/events/${eventId}/dashboard/stats`,
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message || "Failed to fetch dashboard stats");
  },

  async getRecentScans(eventId: string, limit = 20): Promise<RecentScan[]> {
    const response = await apiClient.get<RecentScan[]>(
      `/api/events/${eventId}/dashboard/recent-scans?limit=${limit}`,
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message || "Failed to fetch recent scans");
  },
};
