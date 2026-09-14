// components/events/CategoryManagement/UserTypesTab.tsx
"use client";

import { useState } from "react";
import {
  Edit3,
  Trash2,
  Plus,
  MoreVertical,
  Tag,
  UserCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RegDataType } from "../types";

interface UserTypesTabProps {
  userTypes: RegDataType[];
  onAdd: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export function UserTypesTab({
  userTypes,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
}: UserTypesTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RegDataType | null>(null);

  const [newTypeName, setNewTypeName] = useState("");
  const [editingType, setEditingType] = useState<RegDataType | null>(null);
  const [editName, setEditName] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---------- Duplicate helpers ----------
  const isDuplicateAdd = (name: string) =>
    name.trim() !== "" &&
    userTypes.some(
      (ut) => ut.regDataTypeName.toLowerCase() === name.trim().toLowerCase(),
    );

  const isDuplicateEdit = (name: string) =>
    name.trim() !== "" &&
    editingType !== null &&
    userTypes.some(
      (ut) =>
        ut.regDataTypeName.toLowerCase() === name.trim().toLowerCase() &&
        ut._id !== editingType._id,
    );

  // ---------- Handlers ----------
  const handleEdit = (type: RegDataType) => {
    setEditingType(type);
    setEditName(type.regDataTypeName);
    setIsEditDialogOpen(true);
  };

  const handleAdd = async () => {
    const name = newTypeName.trim();
    if (!name) return;

    // Client-side guard (extra safety — button is already disabled)
    if (isDuplicateAdd(name)) return;

    setIsSaving(true);
    try {
      await onAdd(name);
      setIsAddDialogOpen(false);
      setNewTypeName("");
    } catch {
      setIsAddDialogOpen(false);
      setNewTypeName("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingType) return;
    const name = editName.trim();
    if (!name) return;

    if (isDuplicateEdit(name)) return;

    setIsSaving(true);
    try {
      await onUpdate(editingType._id, name);
      setIsEditDialogOpen(false);
      setEditingType(null);
      setEditName("");
    } catch {
      setIsEditDialogOpen(false);
      setEditingType(null);
      setEditName("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">User Types</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {userTypes.length} {userTypes.length === 1 ? "type" : "types"}{" "}
            defined
          </p>
        </div>
        <Button
          onClick={() => {
            setNewTypeName("");
            setIsAddDialogOpen(true);
          }}
          size="sm"
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add User Type
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="w-12"></TableHead>
              <TableHead>User Type</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
                  <p className="text-xs text-neutral-500 mt-2">
                    Loading user types...
                  </p>
                </TableCell>
              </TableRow>
            ) : userTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center">
                  <UserCircle className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No user types yet</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Click "Add User Type" to create one
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              userTypes.map((ut) => (
                <TableRow key={ut._id} className="hover:bg-neutral-50">
                  <TableCell>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-orange-600" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm text-neutral-900">
                      {ut.regDataTypeName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-neutral-500 hover:text-orange-600 hover:bg-orange-50"
                        onClick={() => handleEdit(ut)}
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-neutral-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(ut)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
            <p className="text-xs text-neutral-500 mt-2">
              Loading user types...
            </p>
          </div>
        ) : userTypes.length === 0 ? (
          <div className="py-12 text-center">
            <UserCircle className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No user types yet</p>
            <p className="text-xs text-neutral-400 mt-1">
              Tap "Add User Type" to create one
            </p>
          </div>
        ) : (
          userTypes.map((ut) => (
            <div
              key={ut._id}
              className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-white hover:bg-neutral-50 transition"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {ut.regDataTypeName}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-md hover:bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <MoreVertical className="w-4 h-4 text-neutral-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleEdit(ut)}>
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => setDeleteTarget(ut)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Add User Type
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Create a new user type for attendee registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Type Name *</Label>
              <Input
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g. Student, International Delegate"
                className={`h-10 ${
                  isDuplicateAdd(newTypeName)
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                autoFocus
                disabled={isSaving}
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
              />
              {isDuplicateAdd(newTypeName) && (
                <p className="text-xs text-red-600">
                  ⚠️ This user type already exists
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSaving}
              className="w-full sm:w-auto h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                !newTypeName.trim() || isSaving || isDuplicateAdd(newTypeName)
              }
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add User Type"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Edit User Type
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update the name of this user type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Type Name *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter user type name"
                className={`h-10 ${
                  isDuplicateEdit(editName)
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                autoFocus
                disabled={isSaving}
                onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
              />
              {isDuplicateEdit(editName) && (
                <p className="text-xs text-red-600">
                  ⚠️ This user type already exists
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
              className="w-full sm:w-auto h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                !editName.trim() || isSaving || isDuplicateEdit(editName)
              }
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !isDeleting && setDeleteTarget(null)}
      >
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2 text-base sm:text-lg">
              <Trash2 className="w-5 h-5" /> Delete User Type
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete{" "}
              <strong className="text-neutral-900">
                {deleteTarget?.regDataTypeName}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="w-full sm:w-auto h-10 mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto h-10"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
