// components/events/CategoryManagement/CategoriesTab.tsx
"use client";

import { useState } from "react";
import {
  Edit3,
  Trash2,
  Plus,
  Search,
  X,
  Calendar,
  MapPin,
  Clock,
  Settings,
  Filter,
  MoreVertical,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { Category, CategoryGroup } from "../types";

interface CategoriesTabProps {
  categories: Category[];
  categoryGroups: CategoryGroup[];
  onAdd: (category: Omit<Category, "_id" | "eventId">) => Promise<void>;
  onUpdate: (id: string, data: Partial<Category>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

const DAYS = ["1", "2", "3", "4", "5"];
const HALLS = ["A", "B", "C", "D", "E"];

export function CategoriesTab({
  categories,
  categoryGroups,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
}: CategoriesTabProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    categoryCode: "",
    categoryName: "",
    groupCategoryId: "",
    status: "active" as "active" | "inactive",
    day: "",
    hall: "",
    session: "",
    time: "",
  });

  const filteredCategories = categories
    .filter(
      (c) =>
        c.categoryName.toLowerCase().includes(search.toLowerCase()) ||
        c.categoryCode.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(
      (c) =>
        filter === "all" ||
        (filter === "active" ? c.status === "active" : c.status === "inactive"),
    );

  const getGroupName = (groupId: string) =>
    categoryGroups.find((g) => g._id === groupId)?.groupCategoryName ||
    "Unknown";

  const resetForm = () => {
    setFormData({
      categoryCode: "",
      categoryName: "",
      groupCategoryId: "",
      status: "active",
      day: "",
      hall: "",
      session: "",
      time: "",
    });
    setEditingCategory(null);
  };

  const openAddForm = () => {
    resetForm();
    if (categoryGroups.length > 0) {
      setFormData((prev) => ({
        ...prev,
        groupCategoryId: categoryGroups[0]._id,
      }));
    }
    setIsDialogOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      categoryCode: category.categoryCode,
      categoryName: category.categoryName,
      groupCategoryId: category.groupCategoryId,
      status: category.status,
      day: category.day || "",
      hall: category.hall || "",
      session: category.session || "",
      time: category.time || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.categoryCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Category code is required",
        variant: "destructive",
      });
      return;
    }
    if (!formData.categoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }
    if (!formData.groupCategoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category group",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      categoryCode: formData.categoryCode.trim(),
      categoryName: formData.categoryName.trim(),
      groupCategoryId: formData.groupCategoryId,
      status: formData.status,
      day: formData.day || undefined,
      hall: formData.hall || undefined,
      session: formData.session || undefined,
      time: formData.time || undefined,
    };

    setIsSaving(true);
    try {
      if (editingCategory) {
        await onUpdate(editingCategory._id, payload);
      } else {
        await onAdd(payload);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch {
      setIsDialogOpen(false);
      resetForm();
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

  const getMetadataDisplay = (category: Category) => {
    const parts = [];
    if (category.day) parts.push(`Day ${category.day}`);
    if (category.hall) parts.push(`Hall ${category.hall}`);
    if (category.session) parts.push(category.session);
    if (category.time) parts.push(category.time);
    return parts.join(" • ") || "-";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Categories</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"} defined
          </p>
        </div>
        <Button
          onClick={openAddForm}
          size="sm"
          disabled={categoryGroups.length === 0 || loading}
          className="bg-orange-600 hover:bg-orange-700 text-white h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Category
        </Button>
      </div>

      {categoryGroups.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
          ⚠️ No category groups yet. Create at least one group in the{" "}
          <strong>Groups</strong> tab before adding categories.
        </div>
      )}

      {/* Mobile Search + Filter Toggle */}
      <div className="sm:hidden flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      {/* Desktop Search and Filter */}
      <div className="hidden sm:flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name..."
            className="pl-10 h-10"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-40 h-10">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setFilter("all");
          }}
          className="h-10"
        >
          <X className="w-4 h-4 mr-1" /> Clear
        </Button>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && (
        <div className="sm:hidden space-y-3 mb-4 p-3 bg-neutral-50 rounded-lg">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setFilter("all");
              setShowFilters(false);
            }}
            className="w-full h-10"
          >
            <X className="w-4 h-4 mr-1" /> Clear Filters
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Metadata</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
                  <p className="text-xs text-neutral-500 mt-2">
                    Loading categories...
                  </p>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <Layers className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No categories yet</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Click "Add Category" to create one
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((c) => (
                <TableRow key={c._id} className="hover:bg-neutral-50">
                  <TableCell>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-orange-600" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-neutral-600">
                      {c.categoryCode}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm text-neutral-900">
                      {c.categoryName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-neutral-600">
                      {getGroupName(c.groupCategoryId)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-neutral-500">
                      {getMetadataDisplay(c)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        c.status === "active"
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-neutral-100 text-neutral-500 border-0"
                      }
                    >
                      {c.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-neutral-500 hover:text-orange-600 hover:bg-orange-50"
                        onClick={() => openEditForm(c)}
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-neutral-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(c)}
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
              Loading categories...
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-12 text-center">
            <Layers className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No categories yet</p>
            <p className="text-xs text-neutral-400 mt-1">
              Tap "Add Category" to create one
            </p>
          </div>
        ) : (
          filteredCategories.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-white hover:bg-neutral-50 transition"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] text-neutral-500">
                      {c.categoryCode}
                    </span>
                    <Badge
                      className={`text-[10px] ${
                        c.status === "active"
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-neutral-100 text-neutral-500 border-0"
                      }`}
                    >
                      {c.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {c.categoryName}
                  </div>
                  <div className="text-xs text-neutral-500 truncate mt-0.5">
                    {getGroupName(c.groupCategoryId)}
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
                  <DropdownMenuItem onClick={() => openEditForm(c)}>
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => setDeleteTarget(c)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingCategory
                ? "Update the category details below."
                : "Create a new category for this event."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Category Code *</Label>
                <Input
                  value={formData.categoryCode}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryCode: e.target.value })
                  }
                  placeholder="e.g. HALL-A-D1"
                  className="h-10"
                  autoFocus
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Category Name *</Label>
                <Input
                  value={formData.categoryName}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryName: e.target.value })
                  }
                  placeholder="e.g. Hall A - Day 1"
                  className="h-10"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Category Group *</Label>
              <Select
                value={formData.groupCategoryId}
                onValueChange={(v) =>
                  setFormData({ ...formData, groupCategoryId: v })
                }
                disabled={isSaving}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select category group" />
                </SelectTrigger>
                <SelectContent>
                  {categoryGroups.map((g) => (
                    <SelectItem key={g._id} value={g._id}>
                      {g.groupCategoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.status === "active"}
                onCheckedChange={(v) =>
                  setFormData({
                    ...formData,
                    status: v ? "active" : "inactive",
                  })
                }
                disabled={isSaving}
              />
              <Label className="text-sm">Active</Label>
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium text-sm text-neutral-800 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Metadata (Optional)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    Day
                  </Label>
                  <Select
                    value={formData.day}
                    onValueChange={(v) => setFormData({ ...formData, day: v })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>
                          Day {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    Hall / Room
                  </Label>
                  <Select
                    value={formData.hall}
                    onValueChange={(v) => setFormData({ ...formData, hall: v })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select hall" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {HALLS.map((hall) => (
                        <SelectItem key={hall} value={hall}>
                          Hall {hall}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    Session / Time
                  </Label>
                  <Input
                    value={formData.session}
                    onChange={(e) =>
                      setFormData({ ...formData, session: e.target.value })
                    }
                    placeholder="e.g. Morning Session"
                    className="h-10"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Time Slot</Label>
                  <Input
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g. 10:00 - 12:00"
                    className="h-10"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
              className="w-full sm:w-auto h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                !formData.categoryCode.trim() ||
                !formData.categoryName.trim() ||
                !formData.groupCategoryId
              }
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingCategory ? (
                "Save Changes"
              ) : (
                "Add Category"
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
              <Trash2 className="w-5 h-5" /> Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete{" "}
              <strong className="text-neutral-900">
                {deleteTarget?.categoryName}
              </strong>{" "}
              ({deleteTarget?.categoryCode})? This action cannot be undone.
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
