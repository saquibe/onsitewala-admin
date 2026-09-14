// app/events/[id]/dashboard/_context/DataContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { categoriesApi, groupCategoriesApi, regDataTypesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type {
  UserType,
  CategoryGroup,
  Category,
  CategoryPermission,
  PrintUser,
  ScanUser,
  RegDataType,
} from "@/components/events/types";

interface DataContextType {
  userTypes: UserType[];
  categoryGroups: CategoryGroup[];
  categories: Category[];
  permissions: CategoryPermission[];
  printUsers: PrintUser[];
  scanUsers: ScanUser[];
  loadingCategories: boolean;
  loadingGroups: boolean;
  loadingUserTypes: boolean;

  addUserType: (name: string) => Promise<void>;
  updateUserType: (id: string, name: string) => Promise<void>;
  deleteUserType: (id: string) => Promise<void>;

  addCategoryGroup: (
    group: Omit<CategoryGroup, "_id" | "eventId">,
  ) => Promise<void>;
  updateCategoryGroup: (
    id: string,
    data: Partial<CategoryGroup>,
  ) => Promise<void>;
  deleteCategoryGroup: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, "_id" | "eventId">) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  togglePermission: (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => void;
  bulkAllowAll: (userTypeId: string) => void;
  bulkBlockAll: (userTypeId: string) => void;

  addUser: (
    user: Omit<PrintUser, "id" | "printed" | "userTypeName">,
    permissions: CategoryPermission[],
  ) => void;
  editUser: (
    id: string,
    data: Partial<PrintUser>,
    permissions: CategoryPermission[],
  ) => void;
  deleteUser: (id: string) => void;
  printBadge: (userId: string) => void;
  bulkPrint: (userIds: string[]) => void;
  scanUser: (userId: string, categoryId: string) => void;

  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useDashboardData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error(
      "useDashboardData must be used within DashboardDataProvider",
    );
  }
  return ctx;
}

// ============================================
// Adapter: RegDataType (backend) → UserType (UI)
// ============================================
const regDataTypeToUserType = (r: RegDataType): UserType => ({
  _id: r._id,
  eventId: r.eventId,
  userTypeName: r.regDataTypeName,
  regDataTypeName: r.regDataTypeName,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

export function DashboardDataProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: ReactNode;
}) {
  const { toast } = useToast();

  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [permissions, setPermissions] = useState<CategoryPermission[]>([]);
  const [printUsers, setPrintUsers] = useState<PrintUser[]>([]);
  const [scanUsers, setScanUsers] = useState<ScanUser[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);

  // ============================================
  // Load user types (from reg-data-types endpoint)
  // ============================================
  const loadUserTypes = useCallback(async () => {
    setLoadingUserTypes(true);
    try {
      const data = await regDataTypesApi.getRegDataTypes(eventId, {
        limit: 100,
      });
      console.log("🔵 loaded user types:", data.length, data);
      setUserTypes((data || []).map((item) => regDataTypeToUserType(item)));
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to load user types",
        variant: "destructive",
      });
    } finally {
      setLoadingUserTypes(false);
    }
  }, [eventId, toast]);

  // ============================================
  // Load categories
  // ============================================
  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await categoriesApi.getCategories(eventId, { limit: 200 });
      setCategories(data || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  }, [eventId, toast]);

  // ============================================
  // Load category groups
  // ============================================
  const loadGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const data = await groupCategoriesApi.getGroupCategories(eventId, {
        limit: 100,
      });
      setCategoryGroups(data || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to load category groups",
        variant: "destructive",
      });
    } finally {
      setLoadingGroups(false);
    }
  }, [eventId, toast]);

  // Single mount effect that loads everything
  useEffect(() => {
    loadUserTypes();
    loadCategories();
    loadGroups();
  }, [loadUserTypes, loadCategories, loadGroups]);

  // ============================================
  // User Type handlers (API-backed via reg-data-types)
  // ============================================
  const addUserType = async (name: string) => {
    try {
      await regDataTypesApi.createRegDataType(eventId, {
        regDataTypeName: name,
      });
      await loadUserTypes();
      toast({ title: "Success", description: "User type added successfully" });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to add user type",
        variant: "destructive",
      });
      throw e;
    }
  };

  const updateUserType = async (id: string, name: string) => {
    try {
      const updated = await regDataTypesApi.updateRegDataType(eventId, id, {
        regDataTypeName: name,
      });
      setUserTypes((prev) =>
        prev.map((ut) => (ut._id === id ? regDataTypeToUserType(updated) : ut)),
      );
      toast({
        title: "Success",
        description: "User type updated successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update user type",
        variant: "destructive",
      });
      throw e;
    }
  };

  const deleteUserType = async (id: string) => {
    try {
      await regDataTypesApi.deleteRegDataType(eventId, id);
      setUserTypes((prev) => prev.filter((ut) => ut._id !== id));
      toast({
        title: "Success",
        description: "User type deleted successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to delete user type",
        variant: "destructive",
      });
      throw e;
    }
  };

  // ============================================
  // Category Group handlers (API-backed)
  // ============================================
  const addCategoryGroup = async (
    group: Omit<CategoryGroup, "_id" | "eventId">,
  ) => {
    try {
      const created = await groupCategoriesApi.createGroupCategory(eventId, {
        groupCategoryName: group.groupCategoryName,
        description: group.description,
      });
      setCategoryGroups((prev) => [...prev, created]);
      toast({
        title: "Success",
        description: "Category group added successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to add category group",
        variant: "destructive",
      });
      throw e;
    }
  };

  const updateCategoryGroup = async (
    id: string,
    data: Partial<CategoryGroup>,
  ) => {
    try {
      const updated = await groupCategoriesApi.updateGroupCategory(
        eventId,
        id,
        {
          groupCategoryName: data.groupCategoryName,
          description: data.description,
        },
      );
      setCategoryGroups((prev) =>
        prev.map((g) => (g._id === id ? updated : g)),
      );
      toast({
        title: "Success",
        description: "Category group updated successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update category group",
        variant: "destructive",
      });
      throw e;
    }
  };

  const deleteCategoryGroup = async (id: string) => {
    try {
      await groupCategoriesApi.deleteGroupCategory(eventId, id);
      setCategoryGroups((prev) => prev.filter((g) => g._id !== id));
      toast({
        title: "Success",
        description: "Category group deleted successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to delete category group",
        variant: "destructive",
      });
      throw e;
    }
  };

  // ============================================
  // Category handlers (API-backed)
  // ============================================
  const addCategory = async (category: Omit<Category, "_id" | "eventId">) => {
    try {
      const created = await categoriesApi.createCategory(eventId, {
        categoryCode: category.categoryCode,
        categoryName: category.categoryName,
        groupCategoryId: category.groupCategoryId,
        status: category.status,
        day: category.day,
        hall: category.hall,
        session: category.session,
        time: category.time,
      });
      setCategories((prev) => [...prev, created]);
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to add category",
        variant: "destructive",
      });
      throw e;
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      const updated = await categoriesApi.updateCategory(eventId, id, {
        categoryCode: data.categoryCode,
        categoryName: data.categoryName,
        groupCategoryId: data.groupCategoryId,
        status: data.status,
        day: data.day,
        hall: data.hall,
        session: data.session,
        time: data.time,
      });
      setCategories((prev) => prev.map((c) => (c._id === id ? updated : c)));
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update category",
        variant: "destructive",
      });
      throw e;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesApi.deleteCategory(eventId, id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to delete category",
        variant: "destructive",
      });
      throw e;
    }
  };

  // ============================================
  // Permission handlers (local state)
  // ============================================
  const togglePermission = (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => {
    setPermissions((prev) => {
      const existing = prev.find(
        (p) => p.userTypeId === userTypeId && p.categoryId === categoryId,
      );
      if (existing) {
        return prev.map((p) =>
          p.userTypeId === userTypeId && p.categoryId === categoryId
            ? { ...p, allowed }
            : p,
        );
      }
      return [...prev, { userTypeId, categoryId, allowed }];
    });
  };

  const bulkAllowAll = (userTypeId: string) => {
    const newPerms = categories.map((cat) => ({
      userTypeId,
      categoryId: cat._id,
      allowed: true,
    }));
    setPermissions((prev) => [
      ...prev.filter((p) => p.userTypeId !== userTypeId),
      ...newPerms,
    ]);
  };

  const bulkBlockAll = (userTypeId: string) => {
    const newPerms = categories.map((cat) => ({
      userTypeId,
      categoryId: cat._id,
      allowed: false,
    }));
    setPermissions((prev) => [
      ...prev.filter((p) => p.userTypeId !== userTypeId),
      ...newPerms,
    ]);
  };

  // ============================================
  // Print User handlers (local state)
  // ============================================
  const addUser = (
    user: Omit<PrintUser, "id" | "printed" | "userTypeName">,
    userPerms: CategoryPermission[],
  ) => {
    const newUser: PrintUser = {
      ...user,
      id: `user_${Date.now()}`,
      printed: false,
      userTypeName:
        userTypes.find((ut) => ut._id === user.userTypeId)?.userTypeName || "",
      permissions: userPerms,
    };
    setPrintUsers((prev) => [...prev, newUser]);

    userPerms.forEach((p) => {
      const existing = permissions.find(
        (perm) =>
          perm.userTypeId === p.userTypeId && perm.categoryId === p.categoryId,
      );
      if (!existing) {
        setPermissions((prev) => [...prev, p]);
      }
    });
  };

  const editUser = (
    id: string,
    data: Partial<PrintUser>,
    userPerms: CategoryPermission[],
  ) => {
    setPrintUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, ...data, permissions: userPerms } : u,
      ),
    );
  };

  const deleteUser = (id: string) => {
    setPrintUsers((prev) => prev.filter((u) => u.id !== id));
    setScanUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const printBadge = (userId: string) => {
    setPrintUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, printed: true } : u)),
    );
  };

  const bulkPrint = (userIds: string[]) => {
    setPrintUsers((prev) =>
      prev.map((u) => (userIds.includes(u.id) ? { ...u, printed: true } : u)),
    );
  };

  const scanUser = (userId: string, categoryId: string) => {
    setScanUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, scanned: true } : u)),
    );
  };

  const refresh = async () => {
    await Promise.all([loadUserTypes(), loadCategories(), loadGroups()]);
  };

  return (
    <DataContext.Provider
      value={{
        userTypes,
        categoryGroups,
        categories,
        permissions,
        printUsers,
        scanUsers,
        loadingCategories,
        loadingGroups,
        loadingUserTypes,
        addUserType,
        updateUserType,
        deleteUserType,
        addCategoryGroup,
        updateCategoryGroup,
        deleteCategoryGroup,
        addCategory,
        updateCategory,
        deleteCategory,
        togglePermission,
        bulkAllowAll,
        bulkBlockAll,
        addUser,
        editUser,
        deleteUser,
        printBadge,
        bulkPrint,
        scanUser,
        refresh,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
