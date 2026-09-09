// components/events/DataManagement/index.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Download,
  RefreshCw,
  FileText,
  Loader2,
  Trash2,
  AlertTriangle,
  Plus,
  Database,
  CheckCircle,
  XCircle as XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type {
  PrintUser,
  UserType,
  Category,
  CategoryPermission,
} from "../types";

interface DataManagementProps {
  users: PrintUser[];
  userTypes: UserType[];
  categories: Category[];
  permissions: CategoryPermission[];
  onAddUser: (
    user: Omit<PrintUser, "id" | "printed" | "userTypeName">,
    userPermissions: CategoryPermission[],
  ) => void;
  onImportCSV: (file: File) => Promise<void>;
  onExportCSV: () => void;
  onExportWithScans: () => void;
  onDeleteAllUsers: () => void;
  onRefresh: () => void;
  onTogglePermission: (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => void;
  onBulkAllowAll: (userTypeId: string, categoryIds: string[]) => void;
  onBulkBlockAll: (userTypeId: string, categoryIds: string[]) => void;
  loading?: boolean;
}

export function DataManagement({
  users,
  userTypes,
  categories,
  permissions,
  onAddUser,
  onImportCSV,
  onExportCSV,
  onExportWithScans,
  onDeleteAllUsers,
  onRefresh,
  onTogglePermission,
  onBulkAllowAll,
  onBulkBlockAll,
  loading = false,
}: DataManagementProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Form state
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

  // Reset form permissions when user type changes
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

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await onImportCSV(file);
      setFile(null);
      toast({ title: "Success", description: "File imported successfully" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUser = () => {
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
    onAddUser(formData, formPermissions);
    setShowAddDialog(false);
    resetForm();
    toast({ title: "Success", description: "User added successfully" });
  };

  const resetForm = () => {
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

  const openAddForm = () => {
    resetForm();
    // Set initial user type to first one if available
    const initialUserType = userTypes.length > 0 ? userTypes[0].id : "";
    if (initialUserType) {
      setSelectedUserTypeId(initialUserType);
      setFormData({ ...formData, userTypeId: initialUserType });
      const initialPermissions = permissions.filter(
        (p) => p.userTypeId === initialUserType,
      );
      setFormPermissions(initialPermissions);
    }
    setShowAddDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Import/Export */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Import / Export Users
            </h2>
            <p className="text-sm text-neutral-500">
              Upload users via CSV (upsert by registration_no) or download all
              users as CSV.
            </p>
          </div>
          <Button variant="outline" onClick={onRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-orange-600" /> Import CSV
            </h3>
            <p className="text-xs text-neutral-500 mb-3">
              Required: registration_no*, user_type_id*
              <br />
              Optional: email, full_name, phone, IMC_number, custom_field1,
              custom_field2, note, reference
            </p>
            <div className="space-y-3">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="max-w-xs"
              />
              {file && (
                <span className="text-sm text-neutral-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" /> {file.name}
                </span>
              )}
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1" /> Upload CSV
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" /> Export
            </h3>
            <p className="text-xs text-neutral-500 mb-3">
              Download all users as CSV or include scan data.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={onExportCSV} className="gap-2">
                <Download className="w-4 h-4" /> Download CSV
              </Button>
              <Button
                variant="outline"
                onClick={onExportWithScans}
                className="gap-2"
              >
                <Database className="w-4 h-4" /> Export Users + Scans
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Button */}
      <div className="flex justify-end">
        <Button
          onClick={openAddForm}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="border-2 border-red-200 rounded-lg p-5 bg-red-50">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">
              Danger Zone: Delete all users
            </h3>
            <p className="text-sm text-red-600 mt-1">
              This action is irreversible. Consider downloading a CSV backup
              first.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="mt-3 gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete ALL Users
            </Button>
          </div>
        </div>
      </div>

      {/* Add User Dialog with Permissions */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Add a new user to the system and set their permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Registration No *</Label>
              <Input
                value={formData.registrationNo}
                onChange={(e) =>
                  setFormData({ ...formData, registrationNo: e.target.value })
                }
                placeholder="SPOT-0001"
              />
            </div>
            <div className="space-y-2">
              <Label>User Type *</Label>
              <Select
                value={formData.userTypeId}
                onValueChange={handleUserTypeChange}
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

          {/* Permissions Section */}
          {selectedUserTypeId && categories.length > 0 && (
            <div className="border-t pt-4 mt-2">
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
            <div className="border-t pt-4 mt-2">
              <div className="text-center py-4 text-neutral-500">
                <p className="text-sm">
                  Select a user type to manage permissions
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Delete ALL Users
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              users and their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onDeleteAllUsers();
                setShowDeleteDialog(false);
              }}
            >
              Yes, Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
