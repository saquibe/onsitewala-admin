// app/events/[id]/dashboard/_context/DataContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import {
  categoriesApi,
  groupCategoriesApi,
  regDataTypesApi,
  privilegesApi,
  registrationDataApi,
  toPrintUser,
  toCreatePayload,
  toUpdatePayload,
  registrationScanApi,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type {
  RegDataType,
  CategoryGroup,
  Category,
  CategoryPermission,
  PrintUser,
  ScanUser,
  ScanSummaryGroup,
  ScanResultData,
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
  loadingPrintUsers: boolean;

  scanSummary: ScanSummaryGroup[];
  loadingScanSummary: boolean;
  scanUser: (regNum: string, categoryId: string) => Promise<ScanResultData>;
  refreshScanSummary: () => Promise<void>;

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
    permissions?: CategoryPermission[],
  ) => Promise<void>;
  editUser: (
    id: string,
    data: Partial<PrintUser>,
    permissions?: CategoryPermission[],
  ) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  printBadge: (userId: string) => Promise<void>;
  bulkPrint: (userIds: string[]) => Promise<void>;
  printSummary: { total: number; printed: number; notPrinted: number };
  refreshPrintSummary: () => Promise<void>;
  // scanUser: (userId: string, categoryId: string) => void;

  importCSV: (file: File, regDataTypeId: string) => Promise<number>;
  deleteAllUsers: () => Promise<void>;

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
  const [printUsers, setPrintUsers] = useState<PrintUser[]>([]);
  const [scanUsers, setScanUsers] = useState<ScanUser[]>([]);
  const [scanSummary, setScanSummary] = useState<ScanSummaryGroup[]>([]);
  const [loadingScanSummary, setLoadingScanSummary] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [loadingPrintUsers, setLoadingPrintUsers] = useState(false);
  const [scanRecords, setScanRecords] = useState<
    Record<string, Record<string, string>>
  >({});
  const [printSummary, setPrintSummary] = useState({
    total: 0,
    printed: 0,
    notPrinted: 0,
  });

  const refreshPrintSummary = useCallback(async () => {
    try {
      const data = await registrationDataApi.getSummary(eventId);
      setPrintSummary(data);
    } catch {
      setPrintSummary({ total: 0, printed: 0, notPrinted: 0 });
    }
  }, [eventId]);

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
      return data || [];
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to load user types",
        variant: "destructive",
      });
      return [];
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
      return data || [];
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to load categories",
        variant: "destructive",
      });
      return [];
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
      return data || [];
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to load category groups",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoadingGroups(false);
    }
  }, [eventId, toast]);

  // ============================================
  // Load permissions
  // ============================================
  const loadPermissions = useCallback(async () => {
    setLoadingPermissions(true);
    try {
      const matrix = await privilegesApi.getPrivilegeMatrix(eventId);
      const perms: CategoryPermission[] = (matrix.privileges || []).map(
        (p) => ({
          userTypeId: p.regDataTypeId,
          categoryId: p.categoryId,
          allowed: p.isAllowed,
        }),
      );
      setPermissions(perms);
    } catch (e: any) {
      console.warn("Failed to load privilege matrix:", e);
      setPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  }, [eventId]);

  const refreshScanSummary = useCallback(async () => {
    setLoadingScanSummary(true);
    try {
      const data = await registrationScanApi.summary(eventId);
      setScanSummary(data || []);
    } catch (e: any) {
      // don't toast — summary may 403 for some roles
      setScanSummary([]);
    } finally {
      setLoadingScanSummary(false);
    }
  }, [eventId]);

  // ============================================
  // Load print users (registration-data)
  // ============================================
  const loadPrintUsers = useCallback(
    async (types?: RegDataType[]) => {
      setLoadingPrintUsers(true);
      try {
        // Fetch users and scans in parallel
        const [data, scanList] = await Promise.all([
          registrationDataApi.getRegistrationData(eventId, { limit: 500 }),
          registrationScanApi.list(eventId, { limit: 1000 }).catch(() => []),
        ]);

        // Build a map: regNum (lowercase) -> { [categoryId]: scannedAt }
        const scanMap = new Map<string, Record<string, string>>();
        for (const s of scanList) {
          const regNum = s.registrationDataId?.regNum;
          const categoryId = s.categoryId?._id;
          if (!regNum || !categoryId) continue;
          const key = regNum.trim().toLowerCase();
          const bucket = scanMap.get(key) ?? {};
          bucket[categoryId] = s.scannedAt;
          scanMap.set(key, bucket);
        }

        const typesToUse = types && types.length > 0 ? types : userTypes;
        const mapped = (data || []).map((r) => toPrintUser(r, typesToUse));
        setPrintUsers(mapped);

        // Merge scans into ScanUser[]
        const scanMapped: ScanUser[] = mapped.map((u) => {
          const key = u.registrationNo.trim().toLowerCase();
          return {
            id: u.id,
            registrationNo: u.registrationNo,
            userTypeName: u.userTypeName,
            email: u.email,
            fullName: u.fullName,
            phone: u.phone,
            scans: scanMap.get(key) ?? {},
          };
        });
        setScanUsers(scanMapped);

        return mapped;
      } catch (e: any) {
        toast({
          title: "Error",
          description: e.message || "Failed to load registration data",
          variant: "destructive",
        });
        return [];
      } finally {
        setLoadingPrintUsers(false);
      }
    },
    [eventId, userTypes, toast],
  );

  // ============================================
  // Initial load
  // ============================================
  useEffect(() => {
    (async () => {
      const types = await loadUserTypes();
      await Promise.all([
        loadCategories(),
        loadGroups(),
        loadPermissions(),
        loadPrintUsers(types),
      ]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

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
  // Permission handlers
  // ============================================
  const togglePermission = async (
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

    try {
      try {
        await privilegesApi.createPrivilege(eventId, {
          regDataTypeId: userTypeId,
          categoryId,
          isAllowed: allowed,
        });
      } catch (e: any) {
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
      toast({ title: "Success", description: "All categories allowed" });
    } catch (e: any) {
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
      toast({ title: "Success", description: "All categories blocked" });
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
  // User handlers (registration-data)
  // ============================================
  const addUser = async (
    user: Omit<PrintUser, "id" | "printed" | "userTypeName">,
    _userPerms: CategoryPermission[] = [],
  ) => {
    try {
      const payload = toCreatePayload(user);
      const created = await registrationDataApi.createRegistrationData(
        eventId,
        payload,
      );
      const mapped = toPrintUser(created, userTypes);
      setPrintUsers((prev) => [...prev, mapped]);

      setScanUsers((prev) => [
        ...prev,
        {
          id: mapped.id,
          registrationNo: mapped.registrationNo,
          userTypeName: mapped.userTypeName,
          email: mapped.email,
          fullName: mapped.fullName,
          phone: mapped.phone,
          scans: {},
        },
      ]);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to add user",
        variant: "destructive",
      });
      throw e;
    }
  };

  const editUser = async (
    id: string,
    data: Partial<PrintUser>,
    _userPerms: CategoryPermission[] = [],
  ) => {
    try {
      const payload = toUpdatePayload(data);
      const updated = await registrationDataApi.updateRegistrationData(
        eventId,
        id,
        payload,
      );
      const mapped = toPrintUser(updated, userTypes);
      setPrintUsers((prev) => prev.map((u) => (u.id === id ? mapped : u)));
      setScanUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                registrationNo: mapped.registrationNo,
                userTypeName: mapped.userTypeName,
                email: mapped.email,
                fullName: mapped.fullName,
                phone: mapped.phone,
              }
            : u,
        ),
      );
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update user",
        variant: "destructive",
      });
      throw e;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await registrationDataApi.deleteRegistrationData(eventId, id);
      setPrintUsers((prev) => prev.filter((u) => u.id !== id));
      setScanUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: "Success", description: "User deleted successfully" });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to delete user",
        variant: "destructive",
      });
      throw e;
    }
  };

  // ============================================
  // Print + scan (local only)
  // ============================================
  const printBadge = async (userId: string) => {
    setPrintUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, printed: true } : u)),
    );

    try {
      await registrationDataApi.markAsPrinted(eventId, userId);
      refreshPrintSummary().catch(() => {});
    } catch (e: any) {
      setPrintUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, printed: false } : u)),
      );
      toast({
        title: "Print failed",
        description:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to mark as printed",
        variant: "destructive",
      });
      throw e;
    }
  };

  const bulkPrint = async (userIds: string[]) => {
    if (!userIds.length) return;

    setPrintUsers((prev) =>
      prev.map((u) => (userIds.includes(u.id) ? { ...u, printed: true } : u)),
    );

    const results = await Promise.allSettled(
      userIds.map((id) => registrationDataApi.markAsPrinted(eventId, id)),
    );

    const failedIds = userIds.filter(
      (_, i) => results[i].status === "rejected",
    );

    if (failedIds.length > 0) {
      setPrintUsers((prev) =>
        prev.map((u) =>
          failedIds.includes(u.id) ? { ...u, printed: false } : u,
        ),
      );

      const firstError = results.find((r) => r.status === "rejected") as
        | PromiseRejectedResult
        | undefined;

      toast({
        title: "Some prints failed",
        description:
          firstError?.reason?.response?.data?.message ||
          `${failedIds.length} of ${userIds.length} failed to print.`,
        variant: "destructive",
      });
      throw firstError?.reason ?? new Error("Bulk print partially failed");
    } else {
      toast({
        title: "Sent to printer",
        description: `${userIds.length} badge(s) marked as printed.`,
      });
    }

    refreshPrintSummary().catch(() => {});
  };

  const scanUser = async (regNum: string, categoryId: string) => {
    const result = await registrationScanApi.scan(eventId, categoryId, regNum);

    const key = regNum.trim().toLowerCase();
    setScanUsers((prev) =>
      prev.map((u) =>
        u.registrationNo.trim().toLowerCase() === key
          ? {
              ...u,
              scans: { ...(u.scans || {}), [categoryId]: result.scannedAt },
            }
          : u,
      ),
    );

    refreshScanSummary().catch(() => {});
    return result;
  };

  // Compute merged scanUsers
  const mergedScanUsers = useMemo<ScanUser[]>(() => {
    return scanUsers.map((u) => {
      const key = u.registrationNo.trim().toLowerCase();
      const record = scanRecords[key];
      return record ? { ...u, scans: { ...(u.scans || {}), ...record } } : u;
    });
  }, [scanUsers, scanRecords]);

  // ============================================
  // Data management
  // ============================================
  const importCSV = async (file: File, regDataTypeId: string) => {
    try {
      const result = await registrationDataApi.importRegistrationData(
        eventId,
        regDataTypeId,
        file,
      );
      await loadPrintUsers();
      toast({
        title: "Import successful",
        description: `Imported ${result.importedCount} records`,
      });
      return result.importedCount;
    } catch (e: any) {
      toast({
        title: "Import failed",
        description: e.message || "Failed to import registration data",
        variant: "destructive",
      });
      throw e;
    }
  };

  const deleteAllUsers = async () => {
    try {
      const result =
        await registrationDataApi.deleteAllRegistrationData(eventId);
      setPrintUsers([]);
      setScanUsers([]);
      toast({
        title: "Deleted",
        description: `Removed ${result.deletedCount} records`,
        variant: "destructive",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to delete all users",
        variant: "destructive",
      });
      throw e;
    }
  };

  const refresh = async () => {
    const types = await loadUserTypes();
    await Promise.all([
      loadCategories(),
      loadGroups(),
      loadPermissions(),
      loadPrintUsers(types),
    ]);
  };

  useEffect(() => {
    (async () => {
      const types = await loadUserTypes();
      await Promise.all([
        loadCategories(),
        loadGroups(),
        loadPermissions(),
        loadPrintUsers(types),
        refreshScanSummary(),
        refreshPrintSummary(),
      ]);
    })();
  }, [eventId]);

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
        loadingPrintUsers,
        scanSummary,
        loadingScanSummary,
        printSummary,
        refreshPrintSummary,
        refreshScanSummary,
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
        importCSV,
        deleteAllUsers,
        refresh,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
