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
}

// ============================================
// Scan User
// ============================================
export interface ScanUser {
  id: string;
  registrationNo: string;
  userTypeName: string;
  email: string;
  fullName: string;
  phone: string;
  scanned: boolean;
}

// ============================================
// Scan Category
// ============================================
export interface ScanCategory {
  id: string;
  name: string;
  group: string;
  count: number;
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
