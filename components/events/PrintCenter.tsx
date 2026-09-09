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
import { useToast } from "@/hooks/use-toast";
import type {
  PrintUser,
  UserType,
  Category,
  CategoryPermission,
} from "./types";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

interface PrintCenterProps {
  users: PrintUser[];
  userTypes: UserType[];
  categories: Category[];
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

  // Permissions state for the form
  const [formPermissions, setFormPermissions] = useState<CategoryPermission[]>(
    [],
  );
  const [selectedUserTypeId, setSelectedUserTypeId] = useState("");

  // Group categories by group name
  const groupedCategories = categories.reduce(
    (acc, cat) => {
      const group = cat.groupId || "Uncategorized";
      if (!acc[group]) acc[group] = [];
      acc[group].push(cat);
      return acc;
    },
    {} as Record<string, Category[]>,
  );

  const getGroupName = (groupId: string) => {
    const groupNames: Record<string, string> = {
      "1": "Certificate Scan",
      "2": "Food Scan",
      "3": "Gift",
    };
    return groupNames[groupId] || groupId;
  };

  const filteredUsers = users.filter((u) => {
    const search = searchQuery.toLowerCase();
    return (
      (u.registrationNo.toLowerCase().includes(search) ||
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)) &&
      (userTypeFilter === "all" || u.userTypeId === userTypeFilter)
    );
  });

  // Reset form permissions when user type changes
  useEffect(() => {
    if (selectedUserTypeId) {
      // Get existing permissions for this user type
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

    // Call the parent handler to update the global permissions
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
      // Edit existing user - pass the permissions along with user data
      onEditUser(editUser.id, formData, formPermissions);
    } else {
      // Add new user - pass the permissions along with user data
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
    // Load permissions for this user type
    const userPermissions = permissions.filter(
      (p) => p.userTypeId === user.userTypeId,
    );
    setFormPermissions(userPermissions);
    setAddUserOpen(true);
  };

  const openAddForm = () => {
    resetForm();
    // Set initial user type to first one if available, or empty
    const initialUserType = userTypes.length > 0 ? userTypes[0].id : "";
    if (initialUserType) {
      setSelectedUserTypeId(initialUserType);
      setFormData({ ...formData, userTypeId: initialUserType });
      // Load permissions for the initial user type
      const initialPermissions = permissions.filter(
        (p) => p.userTypeId === initialUserType,
      );
      setFormPermissions(initialPermissions);
    }
    setAddUserOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Print Center</h2>
          <p className="text-sm text-neutral-500">
            Search users, filter by user type, paginate results, and edit user
            details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={openAddForm}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Button>
          {selectedUsers.length > 0 && (
            <Button
              onClick={() => onBulkPrint(selectedUsers)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="w-4 h-4 mr-1" /> Print Selected (
              {selectedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pl-10"
          />
        </div>
        <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All user types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All user types</SelectItem>
            {userTypes.map((ut) => (
              <SelectItem key={ut.id} value={ut.id}>
                {ut.typeName}
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
          className="gap-2"
        >
          <XCircle className="w-4 h-4" /> Clear
        </Button>
        <Button variant="outline" onClick={onExportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" className="gap-2" asChild>
            <span>
              <Upload className="w-4 h-4" /> Import CSV
            </span>
          </Button>
        </label>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
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
                            : "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                        }
                        onClick={() => onPrintBadge(user.id)}
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />{" "}
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

      {/* Add/Edit User Sheet with Permissions */}
      <Sheet open={addUserOpen} onOpenChange={setAddUserOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editUser ? "Edit User" : "Add User"}</SheetTitle>
            <SheetDescription>
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
            className="space-y-4 px-4 py-4"
          >
            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration No *</Label>
                <Input
                  value={formData.registrationNo}
                  onChange={(e) =>
                    setFormData({ ...formData, registrationNo: e.target.value })
                  }
                  required
                  placeholder="SPOT-0001"
                />
              </div>
              <div className="space-y-2">
                <Label>User Type *</Label>
                <Select
                  value={formData.userTypeId}
                  onValueChange={handleUserTypeChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((ut) => (
                      <SelectItem key={ut.id} value={ut.id}>
                        {ut.typeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label>IMC Number</Label>
                <Input
                  value={formData.imcNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, imcNumber: e.target.value })
                  }
                  placeholder="IMC123"
                />
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Reference"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Note</Label>
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

            {/* Permissions Section - Show when user type is selected */}
            {selectedUserTypeId && categories.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-900">
                    User Type × Category Permissions
                  </h3>
                  <span className="text-xs text-neutral-500">
                    ✔ = allow, empty = block
                  </span>
                </div>

                <div className="space-y-4">
                  {Object.entries(groupedCategories).map(
                    ([groupId, groupCats]) => (
                      <div key={groupId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-neutral-800">
                            {getGroupName(groupId)}
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 text-xs"
                              onClick={() =>
                                handleBulkAllow(groupCats.map((c) => c.id))
                              }
                            >
                              Allow all
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 text-xs"
                              onClick={() =>
                                handleBulkBlock(groupCats.map((c) => c.id))
                              }
                            >
                              Block all
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {groupCats.map((cat) => {
                            const allowed = isPermissionAllowed(
                              selectedUserTypeId,
                              cat.id,
                            );
                            return (
                              <div
                                key={cat.id}
                                className="flex items-center justify-between py-1 px-2 hover:bg-neutral-50 rounded"
                              >
                                <span className="text-sm text-neutral-700">
                                  {cat.name}
                                </span>
                                <Button
                                  size="sm"
                                  variant={allowed ? "default" : "outline"}
                                  className={`w-20 ${allowed ? "bg-green-600 hover:bg-green-700" : ""}`}
                                  onClick={() => handleTogglePermission(cat.id)}
                                >
                                  {allowed ? (
                                    <>
                                      <CheckCircle className="w-3.5 h-3.5 mr-1" />{" "}
                                      Allow
                                    </>
                                  ) : (
                                    <>
                                      <XCircleIcon className="w-3.5 h-3.5 mr-1" />{" "}
                                      Block
                                    </>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Show message if no user type selected */}
            {!selectedUserTypeId && categories.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="text-center py-4 text-neutral-500">
                  <p className="text-sm">
                    Select a user type to manage permissions
                  </p>
                </div>
              </div>
            )}

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddUserOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {editUser ? "Save" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
