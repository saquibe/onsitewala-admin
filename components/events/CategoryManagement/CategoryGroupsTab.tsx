// components/events/CategoryManagement/CategoryGroupsTab.tsx
"use client";

import { useState } from "react";
import {
  Edit3,
  Trash2,
  Plus,
  MoreVertical,
  FolderTree,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import type { CategoryGroup } from "../types";

interface CategoryGroupsTabProps {
  categoryGroups: CategoryGroup[];
  onAdd: (group: Omit<CategoryGroup, "_id" | "eventId">) => Promise<void>;
  onUpdate: (id: string, data: Partial<CategoryGroup>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export function CategoryGroupsTab({
  categoryGroups,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
}: CategoryGroupsTabProps) {
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryGroup | null>(null);

  const [newGroup, setNewGroup] = useState({
    groupCategoryName: "",
    description: "",
  });

  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [editData, setEditData] = useState({
    groupCategoryName: "",
    description: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---------- Duplicate helpers ----------
  const isDuplicateAdd = (name: string) =>
    name.trim() !== "" &&
    categoryGroups.some(
      (g) => g.groupCategoryName.toLowerCase() === name.trim().toLowerCase(),
    );

  const isDuplicateEdit = (name: string) =>
    name.trim() !== "" &&
    editingGroup !== null &&
    categoryGroups.some(
      (g) =>
        g.groupCategoryName.toLowerCase() === name.trim().toLowerCase() &&
        g._id !== editingGroup._id,
    );

  // ---------- Handlers ----------
  const handleAdd = async () => {
    const name = newGroup.groupCategoryName.trim();
    if (!name) return;

    setIsSaving(true);
    try {
      await onAdd({
        groupCategoryName: name,
        description: newGroup.description.trim() || undefined,
      });
      setIsAddDialogOpen(false);
      setNewGroup({ groupCategoryName: "", description: "" });
    } catch {
      setIsAddDialogOpen(false);
      setNewGroup({ groupCategoryName: "", description: "" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (group: CategoryGroup) => {
    setEditingGroup(group);
    setEditData({
      groupCategoryName: group.groupCategoryName,
      description: group.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingGroup) return;
    const name = editData.groupCategoryName.trim();
    if (!name) return;

    setIsSaving(true);
    try {
      await onUpdate(editingGroup._id, {
        groupCategoryName: name,
        description: editData.description.trim() || undefined,
      });
      setIsEditDialogOpen(false);
      setEditingGroup(null);
    } catch {
      setIsEditDialogOpen(false);
      setEditingGroup(null);
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
          <h3 className="text-sm font-semibold text-neutral-900">
            Category Groups
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {categoryGroups.length}{" "}
            {categoryGroups.length === 1 ? "group" : "groups"} defined
          </p>
        </div>
        <Button
          onClick={() => {
            setNewGroup({ groupCategoryName: "", description: "" });
            setIsAddDialogOpen(true);
          }}
          size="sm"
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Category Group
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Group Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
                  <p className="text-xs text-neutral-500 mt-2">
                    Loading category groups...
                  </p>
                </TableCell>
              </TableRow>
            ) : categoryGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center">
                  <FolderTree className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">
                    No category groups yet
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Click "Add Category Group" to create one
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              categoryGroups.map((g) => (
                <TableRow key={g._id} className="hover:bg-neutral-50">
                  <TableCell>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <FolderTree className="w-4 h-4 text-orange-600" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm text-neutral-900">
                      {g.groupCategoryName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-neutral-500">
                      {g.description || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-neutral-500 hover:text-orange-600 hover:bg-orange-50"
                        onClick={() => handleEdit(g)}
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-neutral-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(g)}
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
              Loading category groups...
            </p>
          </div>
        ) : categoryGroups.length === 0 ? (
          <div className="py-12 text-center">
            <FolderTree className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No category groups yet</p>
            <p className="text-xs text-neutral-400 mt-1">
              Tap "Add Category Group" to create one
            </p>
          </div>
        ) : (
          categoryGroups.map((g) => (
            <div
              key={g._id}
              className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-white hover:bg-neutral-50 transition"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <FolderTree className="w-4 h-4 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {g.groupCategoryName}
                  </div>
                  {g.description && (
                    <div className="text-xs text-neutral-500 truncate mt-0.5">
                      {g.description}
                    </div>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-md hover:bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <MoreVertical className="w-4 h-4 text-neutral-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleEdit(g)}>
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => setDeleteTarget(g)}
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
              Add Category Group
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Create a new category group (e.g. Food Scan, Gift).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Group Name *</Label>
              <Input
                value={newGroup.groupCategoryName}
                onChange={(e) =>
                  setNewGroup({
                    ...newGroup,
                    groupCategoryName: e.target.value,
                  })
                }
                placeholder="e.g. Food Scan, Gift, Certificate"
                className={`h-10 ${
                  isDuplicateAdd(newGroup.groupCategoryName)
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                autoFocus
                disabled={isSaving}
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
              />
              {isDuplicateAdd(newGroup.groupCategoryName) && (
                <p className="text-xs text-red-600">
                  ⚠️ This group already exists
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Textarea
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
                placeholder="Optional description"
                rows={2}
                disabled={isSaving}
              />
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
                !newGroup.groupCategoryName.trim() ||
                isSaving ||
                isDuplicateAdd(newGroup.groupCategoryName)
              }
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Category Group"
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
              Edit Category Group
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update the name or description of this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Group Name *</Label>
              <Input
                value={editData.groupCategoryName}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    groupCategoryName: e.target.value,
                  })
                }
                placeholder="Enter group name"
                className={`h-10 ${
                  isDuplicateEdit(editData.groupCategoryName)
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                autoFocus
                disabled={isSaving}
                onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
              />
              {isDuplicateEdit(editData.groupCategoryName) && (
                <p className="text-xs text-red-600">
                  ⚠️ This group already exists
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                placeholder="Optional description"
                rows={2}
                disabled={isSaving}
              />
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
                !editData.groupCategoryName.trim() ||
                isSaving ||
                isDuplicateEdit(editData.groupCategoryName)
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
              <Trash2 className="w-5 h-5" /> Delete Category Group
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete{" "}
              <strong className="text-neutral-900">
                {deleteTarget?.groupCategoryName}
              </strong>
              ? This will not delete categories inside it, but they will become
              orphaned.
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
