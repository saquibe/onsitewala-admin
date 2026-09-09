// app/events/[id]/dashboard/page.tsx
"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  ScanLine,
  Printer,
  FolderTree,
  KeyRound,
  Database,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { eventsApi } from "@/lib/api";
import type { Event } from "@/lib/api";
import {
  ScanCenter,
  PrintCenter,
  CategoryManagement,
  DataManagement,
} from "@/components/events";
import type {
  UserType,
  CategoryGroup,
  Category,
  CategoryPermission,
  PrintUser,
  ScanUser,
  ScanCategory,
} from "@/components/events/types";
import { Privileges } from "@/components/events/Privileges";
import { SettingsSection } from "@/components/events/SettingsSection";
import { DashboardSection } from "@/components/events/DashboardSection";

type Section =
  | "dashboard"
  | "scan"
  | "print"
  | "category"
  | "privileges"
  | "data"
  | "settings";

// Mock Data
const mockUserTypes: UserType[] = [
  { id: "6", typeName: "Delegate" },
  { id: "38", typeName: "Conference Manager" },
  { id: "39", typeName: "Exhibitor" },
  { id: "28", typeName: "Faculty" },
  { id: "30", typeName: "Organising Committee" },
  { id: "42", typeName: "Accompanying person" },
  { id: "44", typeName: "Reception Committee" },
];

const mockCategoryGroups: CategoryGroup[] = [
  {
    id: "1",
    groupName: "Certificate Scan",
    description: "Certificate scanning categories",
  },
  {
    id: "2",
    groupName: "Food Scan",
    description: "Food and dining categories",
  },
  { id: "3", groupName: "Gift", description: "Gift and kit categories" },
];

const mockCategories: Category[] = [
  {
    id: "46",
    code: "10",
    name: "Certificate",
    groupId: "1",
    active: true,
    metadata: { day: 1 },
  },
  {
    id: "44",
    code: "14",
    name: "DAY 01 BREAKFAST (05-09-2026)",
    groupId: "2",
    active: true,
    metadata: { day: 1, session: "Breakfast" },
  },
  {
    id: "48",
    code: "66",
    name: "DAY 01 Dinner (05-09-2026)",
    groupId: "2",
    active: true,
    metadata: { day: 1, session: "Dinner" },
  },
  {
    id: "54",
    code: "121",
    name: "DAY 01 Dinner Plate Count (05-09-2026)",
    groupId: "2",
    active: true,
    metadata: { day: 1, session: "Dinner Plate Count" },
  },
  {
    id: "47",
    code: "11",
    name: "DAY 01 LUNCH (05-09-2026)",
    groupId: "2",
    active: true,
    metadata: { day: 1, session: "Lunch" },
  },
  {
    id: "36",
    code: "33",
    name: "KIT",
    groupId: "3",
    active: true,
    metadata: { day: 1 },
  },
];

const mockScanCategories: ScanCategory[] = [
  { id: "1", name: "Certificate", group: "Certificate Scan", count: 46 },
  {
    id: "2",
    name: "DAY 01 BREAKFAST (05-09-2026)",
    group: "Food Scan",
    count: 44,
  },
  {
    id: "3",
    name: "DAY 01 Dinner (05-09-2026)",
    group: "Food Scan",
    count: 48,
  },
  { id: "4", name: "KIT", group: "Gift", count: 36 },
];

const mockPrintUsers: PrintUser[] = [
  {
    id: "1",
    registrationNo: "SPOT-0041",
    userTypeId: "6",
    userTypeName: "Delegate",
    email: "",
    fullName: "DR SAIVARDHAN REDDY",
    phone: "",
    printed: true,
  },
  {
    id: "2",
    registrationNo: "SPOT-0040",
    userTypeId: "6",
    userTypeName: "Delegate",
    email: "",
    fullName: "DR POORNA ROYAL",
    phone: "",
    printed: true,
  },
  {
    id: "3",
    registrationNo: "SPOT-0039",
    userTypeId: "6",
    userTypeName: "Delegate",
    email: "",
    fullName: "DR SAMBARAJU SINDHU",
    phone: "",
    printed: false,
  },
  {
    id: "4",
    registrationNo: "SPOT-0038",
    userTypeId: "6",
    userTypeName: "Delegate",
    email: "",
    fullName: "DR SAI SUJALA NEELA",
    phone: "",
    printed: false,
  },
];

const mockScanUsers: ScanUser[] = [
  {
    id: "1",
    registrationNo: "SPOT-0041",
    userTypeName: "Delegate",
    email: "",
    fullName: "DR SAIVARDHAN REDDY",
    phone: "",
    scanned: false,
  },
  {
    id: "2",
    registrationNo: "SPOT-0040",
    userTypeName: "Delegate",
    email: "",
    fullName: "DR POORNA ROYAL",
    phone: "",
    scanned: false,
  },
];

const mockPermissions: CategoryPermission[] = [
  { userTypeId: "6", categoryId: "46", allowed: true },
  { userTypeId: "6", categoryId: "44", allowed: false },
];

export default function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("dashboard");

  // State
  const [userTypes, setUserTypes] = useState<UserType[]>(mockUserTypes);
  const [categoryGroups, setCategoryGroups] =
    useState<CategoryGroup[]>(mockCategoryGroups);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [permissions, setPermissions] =
    useState<CategoryPermission[]>(mockPermissions);
  const [printUsers, setPrintUsers] = useState<PrintUser[]>(mockPrintUsers);
  const [scanUsers, setScanUsers] = useState<ScanUser[]>(mockScanUsers);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const eventData = await eventsApi.getEventById(id);
      setEvent(eventData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Print Center Handlers
  // ============================================
  const handleAddUser = (
    user: Omit<PrintUser, "id" | "printed" | "userTypeName">,
    userPermissions: CategoryPermission[],
  ) => {
    const newUser: PrintUser = {
      ...user,
      id: `user_${Date.now()}`,
      printed: false,
      userTypeName:
        userTypes.find((ut) => ut.id === user.userTypeId)?.typeName || "",
      permissions: userPermissions,
    };
    setPrintUsers([...printUsers, newUser]);

    userPermissions.forEach((p) => {
      const existing = permissions.find(
        (perm) =>
          perm.userTypeId === p.userTypeId && perm.categoryId === p.categoryId,
      );
      if (!existing) {
        setPermissions((prev) => [...prev, p]);
      }
    });

    toast({ title: "Success", description: "User added successfully" });
  };

  const handleEditUser = (
    id: string,
    data: Partial<PrintUser>,
    userPermissions: CategoryPermission[],
  ) => {
    setPrintUsers(
      printUsers.map((u) => {
        if (u.id === id) {
          return { ...u, ...data, permissions: userPermissions };
        }
        return u;
      }),
    );

    userPermissions.forEach((p) => {
      const existing = permissions.find(
        (perm) =>
          perm.userTypeId === p.userTypeId && perm.categoryId === p.categoryId,
      );
      if (existing) {
        setPermissions((prev) =>
          prev.map((perm) =>
            perm.userTypeId === p.userTypeId && perm.categoryId === p.categoryId
              ? { ...perm, allowed: p.allowed }
              : perm,
          ),
        );
      } else {
        setPermissions((prev) => [...prev, p]);
      }
    });

    toast({ title: "Success", description: "User updated successfully" });
  };

  const handleDeleteUser = (id: string) => {
    setPrintUsers(printUsers.filter((u) => u.id !== id));
  };

  const handlePrintBadge = (userId: string) => {
    setPrintUsers(
      printUsers.map((u) => (u.id === userId ? { ...u, printed: true } : u)),
    );
  };

  const handleBulkPrint = (userIds: string[]) => {
    setPrintUsers(
      printUsers.map((u) =>
        userIds.includes(u.id) ? { ...u, printed: true } : u,
      ),
    );
  };

  const handleScanUser = (userId: string, categoryId: string) => {
    setScanUsers(
      scanUsers.map((u) => (u.id === userId ? { ...u, scanned: true } : u)),
    );
  };

  // ============================================
  // User Type Handlers
  // ============================================
  const handleAddUserType = (name: string) => {
    const newType: UserType = {
      id: `type_${Date.now()}`,
      typeName: name,
    };
    setUserTypes([...userTypes, newType]);
    toast({ title: "Success", description: "User type added successfully" });
  };

  const handleUpdateUserType = (id: string, name: string) => {
    setUserTypes(
      userTypes.map((ut) => (ut.id === id ? { ...ut, typeName: name } : ut)),
    );
    toast({ title: "Success", description: "User type updated successfully" });
  };

  const handleDeleteUserType = (id: string) => {
    setUserTypes(userTypes.filter((ut) => ut.id !== id));
    toast({ title: "Success", description: "User type deleted successfully" });
  };

  // ============================================
  // Category Group Handlers
  // ============================================
  const handleAddCategoryGroup = (group: Omit<CategoryGroup, "id">) => {
    const newGroup: CategoryGroup = {
      ...group,
      id: `group_${Date.now()}`,
    };
    setCategoryGroups([...categoryGroups, newGroup]);
    toast({
      title: "Success",
      description: "Category group added successfully",
    });
  };

  const handleUpdateCategoryGroup = (
    id: string,
    data: Partial<CategoryGroup>,
  ) => {
    setCategoryGroups(
      categoryGroups.map((g) => (g.id === id ? { ...g, ...data } : g)),
    );
    toast({
      title: "Success",
      description: "Category group updated successfully",
    });
  };

  const handleDeleteCategoryGroup = (id: string) => {
    setCategoryGroups(categoryGroups.filter((g) => g.id !== id));
    toast({
      title: "Success",
      description: "Category group deleted successfully",
    });
  };

  // ============================================
  // Category Handlers
  // ============================================
  const handleAddCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}`,
    };
    setCategories([...categories, newCategory]);

    // Also add to scan categories if needed
    // You can add logic here to sync with scan categories

    toast({ title: "Success", description: "Category added successfully" });
  };

  const handleUpdateCategory = (id: string, data: Partial<Category>) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, ...data } : c)));
    toast({ title: "Success", description: "Category updated successfully" });
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    toast({ title: "Success", description: "Category deleted successfully" });
  };

  // ============================================
  // Permission Handlers
  // ============================================
  const handleTogglePermission = (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => {
    const existing = permissions.find(
      (p) => p.userTypeId === userTypeId && p.categoryId === categoryId,
    );
    if (existing) {
      setPermissions(
        permissions.map((p) =>
          p.userTypeId === userTypeId && p.categoryId === categoryId
            ? { ...p, allowed }
            : p,
        ),
      );
    } else {
      setPermissions([...permissions, { userTypeId, categoryId, allowed }]);
    }
  };

  const handleBulkAllowAll = (userTypeId: string) => {
    const newPermissions = categories.map((cat) => ({
      userTypeId,
      categoryId: cat.id,
      allowed: true,
    }));
    setPermissions([
      ...permissions.filter((p) => p.userTypeId !== userTypeId),
      ...newPermissions,
    ]);
  };

  const handleBulkBlockAll = (userTypeId: string) => {
    const newPermissions = categories.map((cat) => ({
      userTypeId,
      categoryId: cat.id,
      allowed: false,
    }));
    setPermissions([
      ...permissions.filter((p) => p.userTypeId !== userTypeId),
      ...newPermissions,
    ]);
  };

  // ============================================
  // Data Management Handlers
  // ============================================
  const handleImportCSV = async (file: File) => {
    // API call to import CSV
    toast({ title: "Importing", description: `Importing ${file.name}...` });
  };

  const handleExportCSV = () => {
    toast({ title: "Exporting", description: "Downloading users CSV..." });
  };

  const handleExportWithScans = () => {
    toast({
      title: "Exporting",
      description: "Downloading users with scan data...",
    });
  };

  const handleDeleteAllUsers = () => {
    setPrintUsers([]);
    setScanUsers([]);
    toast({
      title: "Deleted",
      description: "All users have been deleted",
      variant: "destructive",
    });
  };

  const handleRefreshData = () => {
    toast({ title: "Refreshed", description: "Data refreshed successfully" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900">
              Event Not Found
            </h2>
            <p className="text-neutral-500 mt-2">
              The event you're looking for doesn't exist.
            </p>
            <Button
              onClick={() => router.push("/events")}
              className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header
        showEventInfo={true}
        eventName={event.eventName}
        eventStatus={event.dynamicStatus || "Draft"}
        startDate={event.startDate}
        endDate={event.endDate}
      />

      <div className="flex-1 flex">
        <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col">
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Admin Panel</span>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <SidebarItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={section === "dashboard"}
              onClick={() => setSection("dashboard")}
            />
            <SidebarItem
              icon={ScanLine}
              label="Scan"
              active={section === "scan"}
              onClick={() => setSection("scan")}
            />
            <SidebarItem
              icon={Printer}
              label="Print Center"
              active={section === "print"}
              onClick={() => setSection("print")}
            />
            <SidebarItem
              icon={FolderTree}
              label="Category"
              active={section === "category"}
              onClick={() => setSection("category")}
            />
            <SidebarItem
              icon={KeyRound}
              label="Privileges"
              active={section === "privileges"}
              onClick={() => setSection("privileges")}
            />
            <SidebarItem
              icon={Database}
              label="Data"
              active={section === "data"}
              onClick={() => setSection("data")}
            />
            <SidebarItem
              icon={Settings}
              label="Settings"
              active={section === "settings"}
              onClick={() => setSection("settings")}
            />
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          {section === "dashboard" && <DashboardSection event={event} />}

          {section === "scan" && (
            <div className="p-6">
              <ScanCenter
                categories={mockScanCategories}
                users={scanUsers}
                userTypes={userTypes}
                onScanUser={handleScanUser}
              />
            </div>
          )}

          {section === "print" && (
            <div className="p-6">
              <PrintCenter
                users={printUsers}
                userTypes={userTypes}
                categories={categories}
                permissions={permissions}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onPrintBadge={handlePrintBadge}
                onBulkPrint={handleBulkPrint}
                onImportCSV={handleImportCSV}
                onExportCSV={handleExportCSV}
                onTogglePermission={handleTogglePermission}
                onBulkAllowAll={handleBulkAllowAll}
                onBulkBlockAll={handleBulkBlockAll}
              />
            </div>
          )}

          {section === "category" && (
            <div className="p-6">
              <CategoryManagement
                userTypes={userTypes}
                categoryGroups={categoryGroups}
                categories={categories}
                onAddUserType={handleAddUserType}
                onUpdateUserType={handleUpdateUserType}
                onDeleteUserType={handleDeleteUserType}
                onAddCategoryGroup={handleAddCategoryGroup}
                onUpdateCategoryGroup={handleUpdateCategoryGroup}
                onDeleteCategoryGroup={handleDeleteCategoryGroup}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            </div>
          )}

          {section === "privileges" && (
            <div className="p-6">
              <Privileges
                userTypes={userTypes}
                categories={categories}
                permissions={permissions}
                onTogglePermission={handleTogglePermission}
                onBulkAllowAll={handleBulkAllowAll}
                onBulkBlockAll={handleBulkBlockAll}
              />
            </div>
          )}

          {section === "data" && (
            <div className="p-6">
              <DataManagement
                users={printUsers}
                userTypes={userTypes}
                categories={categories}
                permissions={permissions}
                onAddUser={handleAddUser}
                onImportCSV={handleImportCSV}
                onExportCSV={handleExportCSV}
                onExportWithScans={handleExportWithScans}
                onDeleteAllUsers={handleDeleteAllUsers}
                onRefresh={handleRefreshData}
                onTogglePermission={handleTogglePermission}
                onBulkAllowAll={(userTypeId, categoryIds) => {
                  const newPermissions = categories.map((cat) => ({
                    userTypeId,
                    categoryId: cat.id,
                    allowed: true,
                  }));
                  setPermissions([
                    ...permissions.filter((p) => p.userTypeId !== userTypeId),
                    ...newPermissions,
                  ]);
                }}
                onBulkBlockAll={(userTypeId, categoryIds) => {
                  const newPermissions = categories.map((cat) => ({
                    userTypeId,
                    categoryId: cat.id,
                    allowed: false,
                  }));
                  setPermissions([
                    ...permissions.filter((p) => p.userTypeId !== userTypeId),
                    ...newPermissions,
                  ]);
                }}
              />
            </div>
          )}

          {section === "settings" && <SettingsSection event={event} />}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-orange-50 text-orange-700 font-semibold" : "text-neutral-600 hover:bg-neutral-50"}`}
    >
      <Icon
        className={`w-4 h-4 ${active ? "text-orange-600" : "text-neutral-400"}`}
      />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
