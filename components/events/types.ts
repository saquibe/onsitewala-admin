// components/events/types.ts

// ============================================
// User Types (backend: user_types collection)
// ============================================
export interface UserType {
  _id: string;
  eventId?: string;
  userTypeName: string;
  regDataTypeName: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Category Group (backend: GroupCategory schema)
// ============================================
export interface CategoryGroup {
  _id: string;
  eventId: string;
  groupCategoryName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Category (backend: Category schema)
// ============================================
export interface Category {
  _id: string;
  eventId: string;
  categoryCode: string;
  categoryName: string;
  groupCategoryId: string;
  status: "active" | "inactive";
  day?: string;
  hall?: string;
  session?: string;
  time?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Reg Data Type (backend: RegDataType schema)
// ============================================
export interface RegDataType {
  _id: string;
  eventId: string;
  regDataTypeName: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Permission
// ============================================
export interface CategoryPermission {
  userTypeId: string;
  categoryId: string;
  allowed: boolean;
}

// ============================================
// Print User
// ============================================
export interface PrintUser {
  id: string;
  registrationNo: string;
  userTypeId: string;
  userTypeName: string;
  email: string;
  fullName: string;
  phone: string;
  imcNumber?: string;
  note?: string;
  reference?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  printed: boolean;
  permissions?: CategoryPermission[];
  printedAt?: string;
}

// ============================================
// Scan User
// ============================================
export interface ScanCategory {
  id: string;
  name: string;
  group: string;
  code?: string;
  scannedCount?: number;
  totalCount?: number;
  coverage?: number;
}

export interface ScanUser {
  id: string;
  registrationNo: string;
  userTypeName: string;
  email: string;
  fullName: string;
  phone: string;
  scans?: Record<string, string>;
}

export interface ScanResultData {
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

export interface ScanSummaryCategory {
  categoryId: string;
  categoryName: string;
  scanned: number;
  total: number;
  coverage: number;
}

export interface ScanSummaryGroup {
  groupCategory: { _id: string; groupCategoryName: string };
  categories: ScanSummaryCategory[];
}

// ============================================
// Dashboard Card
// ============================================
export interface DashboardCard {
  title: string;
  count: number;
  icon: any;
  bg: string;
  text: string;
}
