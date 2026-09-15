// components/events/PrintCenter.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Printer,
  Edit,
  Search,
  Download,
  Upload,
  XCircle,
  CheckCircle,
  XCircle as XCircleIcon,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import type {
  PrintUser,
  RegDataType, // ← was UserType
  Category,
  CategoryGroup, // ← use the proper type
  CategoryPermission,
} from "./types";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { PrintPreviewDialog } from "./PrintPreviewDialog";

interface PrintCenterProps {
  users: PrintUser[];
  userTypes: RegDataType[]; // ← RegDataType[]
  categories: Category[];
  categoryGroups: CategoryGroup[]; // ← CategoryGroup[] not inline type
  permissions: CategoryPermission[];
  onAddUser: (
    user: Omit<PrintUser, "id" | "printed" | "userTypeName">,
    userPermissions: CategoryPermission[],
  ) => void;
  onEditUser: (
    id: string,
    data: Partial<PrintUser>,
    userPermissions: CategoryPermission[],
  ) => void;
  onDeleteUser: (id: string) => void;
  onPrintBadge: (userId: string) => void;
  onBulkPrint: (userIds: string[]) => void;
  onImportCSV: (file: File) => void;
  onExportCSV: () => void;
  onTogglePermission: (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => void;
  onBulkAllowAll: (userTypeId: string, categoryIds: string[]) => void;
  onBulkBlockAll: (userTypeId: string, categoryIds: string[]) => void;
  loading?: boolean;
}

export function PrintCenter({
  users,
  userTypes,
  categories,
  categoryGroups,
  permissions,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onPrintBadge,
  onBulkPrint,
  onImportCSV,
  onExportCSV,
  onTogglePermission,
  onBulkAllowAll,
  onBulkBlockAll,
  loading = false,
}: PrintCenterProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<PrintUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [printPreviewUser, setPrintPreviewUser] = useState<PrintUser | null>(
    null,
  );
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [formData, setFormData] = useState({
    registrationNo: "",
    userTypeId: "",
    email: "",
    fullName: "",
    phone: "",
    imcNumber: "",
    note: "",
    reference: "",
  });

  const [formPermissions, setFormPermissions] = useState<CategoryPermission[]>(
    [],
  );
  const [selectedUserTypeId, setSelectedUserTypeId] = useState("");

  // Group categories by groupCategoryId
  const groupedCategories = categories.reduce(
    (acc, cat) => {
      const group = cat.groupCategoryId || "Uncategorized";
      if (!acc[group]) acc[group] = [];
      acc[group].push(cat);
      return acc;
    },
    {} as Record<string, Category[]>,
  );

  const getGroupName = (groupId: string) =>
    categoryGroups.find((g) => g._id === groupId)?.groupCategoryName ||
    "Uncategorized";

  const filteredUsers = users.filter((u) => {
    const search = searchQuery.toLowerCase();
    return (
      (u.registrationNo.toLowerCase().includes(search) ||
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)) &&
      (userTypeFilter === "all" || u.userTypeId === userTypeFilter)
    );
  });

  useEffect(() => {
    if (selectedUserTypeId) {
      const userPermissions = permissions.filter(
        (p) => p.userTypeId === selectedUserTypeId,
      );
      setFormPermissions(userPermissions);
    } else {
      setFormPermissions([]);
    }
  }, [selectedUserTypeId, permissions]);

  const handleUserTypeChange = (value: string) => {
    setSelectedUserTypeId(value);
    setFormData({ ...formData, userTypeId: value });
  };

  const isPermissionAllowed = (userTypeId: string, categoryId: string) => {
    return formPermissions.some(
      (p) =>
        p.userTypeId === userTypeId && p.categoryId === categoryId && p.allowed,
    );
  };

  const handleTogglePermission = (categoryId: string) => {
    if (!selectedUserTypeId) return;
    const current = isPermissionAllowed(selectedUserTypeId, categoryId);
    const newPermissions = current
      ? formPermissions.filter(
          (p) =>
            !(
              p.userTypeId === selectedUserTypeId && p.categoryId === categoryId
            ),
        )
      : [
          ...formPermissions,
          { userTypeId: selectedUserTypeId, categoryId, allowed: true },
        ];
    setFormPermissions(newPermissions);
    onTogglePermission(selectedUserTypeId, categoryId, !current);
  };

  const handleBulkAllow = (categoryIds: string[]) => {
    if (!selectedUserTypeId) return;
    const newPermissions = [...formPermissions];
    categoryIds.forEach((catId) => {
      const existing = newPermissions.find(
        (p) => p.userTypeId === selectedUserTypeId && p.categoryId === catId,
      );
      if (existing) {
        existing.allowed = true;
      } else {
        newPermissions.push({
          userTypeId: selectedUserTypeId,
          categoryId: catId,
          allowed: true,
        });
      }
    });
    setFormPermissions(newPermissions);
    onBulkAllowAll(selectedUserTypeId, categoryIds);
  };

  const handleBulkBlock = (categoryIds: string[]) => {
    if (!selectedUserTypeId) return;
    const newPermissions = formPermissions.filter(
      (p) =>
        !(
          p.userTypeId === selectedUserTypeId &&
          categoryIds.includes(p.categoryId)
        ),
    );
    setFormPermissions(newPermissions);
    onBulkBlockAll(selectedUserTypeId, categoryIds);
  };

  const handleSaveUser = () => {
    if (
      !formData.registrationNo ||
      !formData.userTypeId ||
      !formData.fullName
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (editUser) {
      onEditUser(editUser.id, formData, formPermissions);
    } else {
      onAddUser(formData, formPermissions);
    }
    setAddUserOpen(false);
    resetForm();
    toast({
      title: "Success",
      description: editUser
        ? "User updated successfully"
        : "User added successfully",
    });
  };

  const resetForm = () => {
    setEditUser(null);
    setSelectedUserTypeId("");
    setFormPermissions([]);
    setFormData({
      registrationNo: "",
      userTypeId: "",
      email: "",
      fullName: "",
      phone: "",
      imcNumber: "",
      note: "",
      reference: "",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportCSV(file);
  };

  const openEditForm = (user: PrintUser) => {
    setEditUser(user);
    setSelectedUserTypeId(user.userTypeId);
    setFormData({
      registrationNo: user.registrationNo,
      userTypeId: user.userTypeId,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      imcNumber: user.imcNumber || "",
      note: user.note || "",
      reference: user.reference || "",
    });
    const userPermissions = permissions.filter(
      (p) => p.userTypeId === user.userTypeId,
    );
    setFormPermissions(userPermissions);
    setAddUserOpen(true);
  };

  const openAddForm = () => {
    resetForm();
    const initialUserType = userTypes.length > 0 ? userTypes[0]._id : "";
    if (initialUserType) {
      setSelectedUserTypeId(initialUserType);
      setFormData({ ...formData, userTypeId: initialUserType });
      const initialPermissions = permissions.filter(
        (p) => p.userTypeId === initialUserType,
      );
      setFormPermissions(initialPermissions);
    }
    setAddUserOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            Print Center
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Search users, filter, and print badges.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            onClick={openAddForm}
            className="bg-orange-600 hover:bg-orange-700 text-white h-9 sm:h-10 flex-1 sm:flex-none"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Button>
          {selectedUsers.length > 0 && (
            <Button
              onClick={() => onBulkPrint(selectedUsers)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 sm:h-10 flex-1 sm:flex-none"
              size="sm"
            >
              <Printer className="w-4 h-4 mr-1" /> Print ({selectedUsers.length}
              )
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Search & Filter */}
      <div className="sm:hidden flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pl-10 h-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-10 px-3"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Desktop Search and Filters */}
      <div className="hidden sm:flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pl-10 h-10"
          />
        </div>
        <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
          <SelectTrigger className="w-48 h-10">
            <SelectValue placeholder="All user types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All user types</SelectItem>
            {userTypes.map((ut) => (
              <SelectItem key={ut._id} value={ut._id}>
                {ut.regDataTypeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setUserTypeFilter("all");
          }}
          className="gap-2 h-10"
        >
          <XCircle className="w-4 h-4" /> Clear
        </Button>
        <Button variant="outline" onClick={onExportCSV} className="gap-2 h-10">
          <Download className="w-4 h-4" /> Export
        </Button>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" className="gap-2 h-10" asChild>
            <span>
              <Upload className="w-4 h-4" /> Import
            </span>
          </Button>
        </label>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && (
        <div className="sm:hidden space-y-3 mb-4 p-3 bg-neutral-50 rounded-lg">
          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="All user types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All user types</SelectItem>
              {userTypes.map((ut) => (
                <SelectItem key={ut._id} value={ut._id}>
                  {ut.regDataTypeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setUserTypeFilter("all");
                setShowFilters(false);
              }}
              className="gap-2 h-10 flex-1"
            >
              <XCircle className="w-4 h-4" /> Clear
            </Button>
            <Button
              variant="outline"
              onClick={onExportCSV}
              className="gap-2 h-10 flex-1"
            >
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
          <label className="cursor-pointer block">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" className="gap-2 h-10 w-full" asChild>
              <span>
                <Upload className="w-4 h-4" /> Import CSV
              </span>
            </Button>
          </label>
        </div>
      )}

      {/* Users Table - Desktop */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="w-10 sticky left-0 bg-neutral-50">
                  <Checkbox
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onCheckedChange={() => {
                      if (selectedUsers.length === filteredUsers.length) {
                        setSelectedUsers([]);
                      } else {
                        setSelectedUsers(filteredUsers.map((u) => u.id));
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="min-w-[100px] sticky left-10 bg-neutral-50">
                  Reg No
                </TableHead>
                <TableHead className="min-w-[120px]">User Type</TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[180px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Phone</TableHead>
                <TableHead className="min-w-[100px]">IMC Number</TableHead>
                <TableHead className="min-w-[100px]">Note</TableHead>
                <TableHead className="min-w-[100px]">Reference</TableHead>
                <TableHead className="min-w-[180px] sticky right-0 bg-neutral-50">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="sticky left-0 bg-white">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => {
                        setSelectedUsers((prev) =>
                          prev.includes(user.id)
                            ? prev.filter((id) => id !== user.id)
                            : [...prev, user.id],
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium sticky left-10 bg-white">
                    {user.registrationNo}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.userTypeName}</Badge>
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>{user.imcNumber || "-"}</TableCell>
                  <TableCell className="max-w-[100px] truncate">
                    {user.note || "-"}
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate">
                    {user.reference || "-"}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-white">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={user.printed ? "default" : "outline"}
                        className={
                          user.printed
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }
                        onClick={() => {
                          setPrintPreviewUser(user);
                          setPrintPreviewOpen(true);
                        }}
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        {user.printed ? "Reprint" : "Print"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(user)}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="border rounded-lg p-3 bg-white hover:bg-neutral-50 transition"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={() => {
                  setSelectedUsers((prev) =>
                    prev.includes(user.id)
                      ? prev.filter((id) => id !== user.id)
                      : [...prev, user.id],
                  );
                }}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-neutral-900 truncate">
                    {user.registrationNo}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] flex-shrink-0 whitespace-nowrap"
                  >
                    {user.userTypeName}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-neutral-800 truncate">
                  {user.fullName}
                </div>
                {user.email && (
                  <div className="text-xs text-neutral-500 truncate mt-0.5">
                    {user.email}
                  </div>
                )}
                {user.phone && (
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant={user.printed ? "default" : "outline"}
                    className={`flex-1 h-9 text-xs ${
                      user.printed
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    onClick={() => {
                      setPrintPreviewUser(user);
                      setPrintPreviewOpen(true);
                    }}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    {user.printed ? "Reprint" : "Print"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 text-xs"
                    onClick={() => openEditForm(user)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            No users found. Click "Add User" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit User Sheet */}
      <Sheet open={addUserOpen} onOpenChange={setAddUserOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <SheetHeader className="p-4 sm:p-6 pb-0">
            <SheetTitle className="text-base sm:text-lg">
              {editUser ? "Edit User" : "Add User"}
            </SheetTitle>
            <SheetDescription className="text-xs sm:text-sm">
              {editUser
                ? "Update the user details and permissions below."
                : "Add a new user and set their permissions."}
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveUser();
            }}
            className="space-y-4 px-4 sm:px-6 py-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Registration No *</Label>
                <Input
                  value={formData.registrationNo}
                  onChange={(e) =>
                    setFormData({ ...formData, registrationNo: e.target.value })
                  }
                  required
                  placeholder="SPOT-0001"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">User Type *</Label>
                <Select
                  value={formData.userTypeId}
                  onValueChange={handleUserTypeChange}
                  required
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((ut) => (
                      <SelectItem key={ut._id} value={ut._id}>
                        {ut.regDataTypeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Full Name *</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">IMC Number</Label>
                <Input
                  value={formData.imcNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, imcNumber: e.target.value })
                  }
                  placeholder="IMC123"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Reference</Label>
                <Input
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Reference"
                  className="h-10"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm">Note</Label>
                <Textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>

            {/* Permissions */}
            {selectedUserTypeId && categories.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h3 className="font-semibold text-sm text-neutral-900">
                    User Type × Category Permissions
                  </h3>
                  <span className="text-[10px] sm:text-xs text-neutral-500">
                    ✔ = allow, empty = block
                  </span>
                </div>
                <div className="space-y-3">
                  {Object.entries(groupedCategories).map(
                    ([groupId, groupCats]) => (
                      <div
                        key={groupId}
                        className="border rounded-lg overflow-hidden"
                      >
                        <Accordion
                          type="single"
                          collapsible
                          defaultValue={groupId}
                        >
                          <AccordionItem value={groupId} className="border-0">
                            <div className="flex items-center justify-between p-3 bg-neutral-50">
                              <AccordionTrigger className="hover:no-underline py-0 flex-1">
                                <h4 className="font-medium text-sm text-neutral-800">
                                  {getGroupName(groupId)}
                                </h4>
                              </AccordionTrigger>
                              <div className="flex gap-1.5 flex-shrink-0 ml-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 text-[10px] h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBulkAllow(
                                      groupCats.map((c) => c._id),
                                    );
                                  }}
                                >
                                  Allow all
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 text-[10px] h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBulkBlock(
                                      groupCats.map((c) => c._id),
                                    );
                                  }}
                                >
                                  Block all
                                </Button>
                              </div>
                            </div>
                            <AccordionContent className="pt-2 pb-0">
                              <div className="space-y-1 p-2">
                                {groupCats.map((cat) => {
                                  const allowed = isPermissionAllowed(
                                    selectedUserTypeId,
                                    cat._id,
                                  );
                                  return (
                                    <div
                                      key={cat._id}
                                      className="flex items-center justify-between py-2 px-2 hover:bg-neutral-50 rounded gap-2"
                                    >
                                      <span className="text-xs sm:text-sm text-neutral-700 flex-1 min-w-0 truncate">
                                        {cat.categoryName}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant={
                                          allowed ? "default" : "outline"
                                        }
                                        className={`w-[72px] sm:w-20 h-7 text-[10px] sm:text-xs flex-shrink-0 ${
                                          allowed
                                            ? "bg-green-600 hover:bg-green-700"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          handleTogglePermission(cat._id)
                                        }
                                      >
                                        {allowed ? (
                                          <>
                                            <CheckCircle className="w-3 h-3 mr-0.5 sm:mr-1" />
                                            Allow
                                          </>
                                        ) : (
                                          <>
                                            <XCircleIcon className="w-3 h-3 mr-0.5 sm:mr-1" />
                                            Block
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {!selectedUserTypeId && categories.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="text-center py-4 text-neutral-500">
                  <p className="text-xs sm:text-sm">
                    Select a user type to manage permissions
                  </p>
                </div>
              </div>
            )}

            <SheetFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddUserOpen(false)}
                className="w-full sm:w-auto h-10 order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10 order-1 sm:order-2"
              >
                {editUser ? "Save" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Print Preview Dialog */}
      <PrintPreviewDialog
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        user={printPreviewUser}
        onConfirmPrint={(userId) => {
          onPrintBadge(userId);
          toast({
            title: "Sent to printer",
            description: `Badge sent for ${printPreviewUser?.fullName}`,
          });
        }}
      />
    </div>
  );
}
