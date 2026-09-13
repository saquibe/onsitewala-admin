// components/events/index.ts
export { DashboardSection } from "./DashboardSection";
export { ScanCenter } from "./ScanCenter";
export { PrintCenter } from "./PrintCenter";
export { SpotRegistration } from "./SpotRegistration";
export { CategoryManagement } from "./CategoryManagement";
export { Privileges } from "./Privileges";
export { DataManagement } from "./DataManagement";
export { SettingsSection } from "./SettingsSection";

// Types (inlined to avoid missing-module error)
export type UserType = "admin" | "editor" | "viewer";

export type CategoryPermission = {
  id: string;
  name: string;
  allowed: boolean;
};

export type Category = {
  id: string;
  title: string;
  groupId?: string;
  permissions?: CategoryPermission[];
};

export type CategoryGroup = {
  id: string;
  name: string;
  categories?: Category[];
};

export type PrintUser = {
  id: string;
  name: string;
  role: UserType;
  canPrint: boolean;
};

export type ScanUser = {
  id: string;
  name: string;
  role: UserType;
  canScan: boolean;
};

export type ScanCategory = Category & { barcode?: string };
