// components/events/types.ts
export interface UserType {
  id: string;
  typeName: string;
}

export interface CategoryGroup {
  id: string;
  groupName: string;
  description?: string;
  icon?: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  groupId: string;
  active: boolean;
  metadata?: {
    day?: number;
    hall?: string;
    session?: string;
    time?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryPermission {
  userTypeId: string;
  categoryId: string;
  allowed: boolean;
}

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
  customField1?: string;
  customField2?: string;
  printed: boolean;
  permissions?: CategoryPermission[]; // Add permissions to user
}

export interface ScanUser {
  id: string;
  registrationNo: string;
  userTypeName: string;
  email: string;
  fullName: string;
  phone: string;
  scanned: boolean;
}

export interface ScanCategory {
  id: string;
  name: string;
  group: string;
  count: number;
}

export interface DashboardCard {
  title: string;
  count: number;
  icon: any;
  bg: string;
  text: string;
}
