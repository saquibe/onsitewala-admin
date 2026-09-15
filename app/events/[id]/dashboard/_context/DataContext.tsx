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
import {
  categoriesApi,
  groupCategoriesApi,
  regDataTypesApi,
  privilegesApi,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type {
  RegDataType,
  CategoryGroup,
  Category,
  CategoryPermission,
  PrintUser,
  ScanUser,
} from "@/components/events/types";

interface DataContextType {
  userTypes: RegDataType[];
  categoryGroups: CategoryGroup[];
  categories: Category[];
  permissions: CategoryPermission[];
  printUsers: PrintUser[];
  scanUsers: ScanUser[];
  loadingCategories: boolean;
  loadingGroups: boolean;
  loadingUserTypes: boolean;
  loadingPermissions: boolean;

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
  ) => Promise<void>;
  bulkAllowAll: (userTypeId: string) => Promise<void>;
  bulkBlockAll: (userTypeId: string) => Promise<void>;

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

// Add a MOCK_PRINT_USERS constant
const MOCK_PRINT_USERS: PrintUser[] = [
  {
    id: "mock_1",
    registrationNo: "SPOT-0041",
    userTypeId: "ut_1",
    userTypeName: "Delegate",
    email: "saivardhan@example.com",
    fullName: "Dr. Saivardhan Reddy",
    phone: "+91 9876543210",
    imcNumber: "IMC001",
    printed: false,
  },
  {
    id: "mock_2",
    registrationNo: "SPOT-0040",
    userTypeId: "ut_2",
    userTypeName: "Faculty",
    email: "poorna@example.com",
    fullName: "Dr. Poorna Royal",
    phone: "+91 9876543211",
    imcNumber: "IMC002",
    printed: true,
  },
  {
    id: "mock_3",
    registrationNo: "SPOT-0039",
    userTypeId: "ut_1",
    userTypeName: "Delegate",
    email: "sindhu@example.com",
    fullName: "Dr. Sambaraju Sindhu",
    phone: "+91 9876543212",
    printed: false,
  },
  {
    id: "mock_4",
    registrationNo: "SPOT-0038",
    userTypeId: "ut_3",
    userTypeName: "Student",
    email: "sujala@example.com",
    fullName: "Dr. Sai Sujala Neela",
    phone: "+91 9876543213",
    imcNumber: "IMC004",
    printed: false,
  },
];

export function DashboardDataProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: ReactNode;
}) {
  const { toast } = useToast();

  const [userTypes, setUserTypes] = useState<RegDataType[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [permissions, setPermissions] = useState<CategoryPermission[]>([]);
  const [printUsers, setPrintUsers] = useState<PrintUser[]>(MOCK_PRINT_USERS);
  const [scanUsers, setScanUsers] = useState<ScanUser[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // ============================================
  // Load user types
  // ============================================
  const loadUserTypes = useCallback(async () => {
    setLoadingUserTypes(true);
    try {
      const data = await regDataTypesApi.getRegDataTypes(eventId, {
        limit: 100,
      });
      setUserTypes(data || []);
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
  // Load groups
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

  // ============================================
  // Load permissions (from privilege matrix)
  // ============================================
  const loadPermissions = useCallback(async () => {
    setLoadingPermissions(true);
    try {
      const matrix = await privilegesApi.getPrivilegeMatrix(eventId);

      // Convert privileges to the UI CategoryPermission shape
      const perms: CategoryPermission[] = (matrix.privileges || []).map(
        (p) => ({
          userTypeId: p.regDataTypeId, // UI field name
          categoryId: p.categoryId,
          allowed: p.isAllowed, // UI field name
        }),
      );

      setPermissions(perms);
    } catch (e: any) {
      // Silent fail on matrix — it's ok if no privileges exist yet
      console.warn("Failed to load privilege matrix:", e);
      setPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  }, [eventId]);

  // ============================================
  // Single mount effect
  // ============================================
  useEffect(() => {
    loadUserTypes();
    loadCategories();
    loadGroups();
    loadPermissions();
  }, [loadUserTypes, loadCategories, loadGroups, loadPermissions]);

  // ============================================
  // User Type handlers
  // ============================================
  const addUserType = async (name: string) => {
    try {
      await regDataTypesApi.createRegDataType(eventId, {
        regDataTypeName: name,
      });
      await loadUserTypes();
      toast({ title: "Success", description: "User type added successfully" });
    } catch (e: any) {
      const backendMessage =
        e.response?.data?.message || e.message || "Failed to add user type";
      const isDuplicate =
        backendMessage.toLowerCase().includes("already exists") ||
        e.response?.status === 409;
      toast({
        title: isDuplicate ? "Already Exists" : "Error",
        description: isDuplicate
          ? `"${name}" is already a user type. Please use a different name.`
          : backendMessage,
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
      setUserTypes((prev) => prev.map((ut) => (ut._id === id ? updated : ut)));
      toast({
        title: "Success",
        description: "User type updated successfully",
      });
    } catch (e: any) {
      const backendMessage =
        e.response?.data?.message || e.message || "Failed to update user type";
      const isDuplicate =
        backendMessage.toLowerCase().includes("already exists") ||
        e.response?.status === 409;
      toast({
        title: isDuplicate ? "Already Exists" : "Error",
        description: isDuplicate
          ? `"${name}" is already a user type. Please use a different name.`
          : backendMessage,
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
  // Category Group handlers
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
  // Category handlers
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
      toast({ title: "Success", description: "Category added successfully" });
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
      toast({ title: "Success", description: "Category updated successfully" });
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
      toast({ title: "Success", description: "Category deleted successfully" });
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
  // Permission handlers — API-backed via privileges
  // ============================================
  const togglePermission = async (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => {
    // Optimistic update
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

    try {
      // Try to create the privilege — if it exists, backend returns 409
      // In that case, we need to find the existing privilege and PATCH it
      try {
        await privilegesApi.createPrivilege(eventId, {
          regDataTypeId: userTypeId,
          categoryId,
          isAllowed: allowed,
        });
      } catch (e: any) {
        // If it's a 409 (duplicate), find the privilege and update it
        if (e.response?.status === 409) {
          const all = await privilegesApi.getPrivileges(eventId, {
            limit: 1000,
          });
          const existing = all.find(
            (p) =>
              p.regDataTypeId === userTypeId && p.categoryId === categoryId,
          );
          if (existing) {
            await privilegesApi.updatePrivilege(eventId, existing._id, {
              isAllowed: allowed,
            });
          }
        } else {
          throw e;
        }
      }
    } catch (e: any) {
      // Revert on error
      setPermissions((prev) =>
        prev.map((p) =>
          p.userTypeId === userTypeId && p.categoryId === categoryId
            ? { ...p, allowed: !allowed }
            : p,
        ),
      );
      toast({
        title: "Error",
        description: e.message || "Failed to update permission",
        variant: "destructive",
      });
      throw e;
    }
  };

  const bulkAllowAll = async (userTypeId: string) => {
    // Optimistic update
    const newPerms = categories.map((cat) => ({
      userTypeId,
      categoryId: cat._id,
      allowed: true,
    }));
    setPermissions((prev) => [
      ...prev.filter((p) => p.userTypeId !== userTypeId),
      ...newPerms,
    ]);

    try {
      await privilegesApi.allowAllCategories(eventId, userTypeId);
      toast({
        title: "Success",
        description: "All categories allowed",
      });
    } catch (e: any) {
      // Reload on error
      await loadPermissions();
      toast({
        title: "Error",
        description: e.message || "Failed to allow all",
        variant: "destructive",
      });
      throw e;
    }
  };

  const bulkBlockAll = async (userTypeId: string) => {
    // Optimistic update
    const newPerms = categories.map((cat) => ({
      userTypeId,
      categoryId: cat._id,
      allowed: false,
    }));
    setPermissions((prev) => [
      ...prev.filter((p) => p.userTypeId !== userTypeId),
      ...newPerms,
    ]);

    try {
      await privilegesApi.blockAllCategories(eventId, userTypeId);
      toast({
        title: "Success",
        description: "All categories blocked",
      });
    } catch (e: any) {
      await loadPermissions();
      toast({
        title: "Error",
        description: e.message || "Failed to block all",
        variant: "destructive",
      });
      throw e;
    }
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
        userTypes.find((ut) => ut._id === user.userTypeId)?.regDataTypeName ||
        "",
      permissions: userPerms,
    };
    setPrintUsers((prev) => [...prev, newUser]);
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
    await Promise.all([
      loadUserTypes(),
      loadCategories(),
      loadGroups(),
      loadPermissions(),
    ]);
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
        loadingPermissions,
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
