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
  CategoryGroup,
  CategoryPermission,
} from "../types";

interface DataManagementProps {
  users: PrintUser[];
  userTypes: UserType[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
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
  categoryGroups,
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
    const initialUserType = userTypes.length > 0 ? userTypes[0]._id : "";
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
