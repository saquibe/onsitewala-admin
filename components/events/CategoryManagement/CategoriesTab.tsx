// components/events/CategoryManagement/CategoriesTab.tsx
"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Calendar,
  MapPin,
  Clock,
  Settings,
  Filter,
  MoreVertical,
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { Category, CategoryGroup } from "../types";

interface CategoriesTabProps {
  categories: Category[];
  categoryGroups: CategoryGroup[];
  onAdd: (category: Omit<Category, "id">) => void;
  onUpdate: (id: string, data: Partial<Category>) => void;
  onDelete: (id: string) => void;
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
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    groupId: "",
    active: true,
    day: "",
    hall: "",
    session: "",
    time: "",
  });

  const filteredCategories = categories
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(
      (c) => filter === "all" || (filter === "active" ? c.active : !c.active),
    );

  const getGroupName = (groupId: string) =>
    categoryGroups.find((g) => g.id === groupId)?.groupName || "Unknown";

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      groupId: "",
      active: true,
      day: "",
      hall: "",
      session: "",
      time: "",
    });
    setEditingCategory(null);
  };

  const openAddForm = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      groupId: category.groupId,
      active: category.active,
      day: category.metadata?.day?.toString() || "",
      hall: category.metadata?.hall || "",
      session: category.metadata?.session || "",
      time: category.metadata?.time || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim() || !formData.groupId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const categoryData = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      groupId: formData.groupId,
      active: formData.active,
      metadata: {
        day: formData.day ? parseInt(formData.day) : undefined,
        hall: formData.hall || undefined,
        session: formData.session || undefined,
        time: formData.time || undefined,
      },
    };

    if (editingCategory) {
      onUpdate(editingCategory.id, categoryData);
      toast({ title: "Success", description: "Category updated successfully" });
    } else {
      onAdd(categoryData);
      toast({ title: "Success", description: "Category added successfully" });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Delete category "${category.name}"?`)) {
      onDelete(category.id);
      toast({ title: "Success", description: "Category deleted successfully" });
    }
  };

  const getMetadataDisplay = (category: Category) => {
    const parts = [];
    if (category.metadata?.day) parts.push(`Day ${category.metadata.day}`);
    if (category.metadata?.hall) parts.push(`Hall ${category.metadata.hall}`);
    if (category.metadata?.session) parts.push(category.metadata.session);
    if (category.metadata?.time) parts.push(category.metadata.time);
    return parts.join(" • ") || "-";
  };

  return (
    <div>
      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={openAddForm}
          className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Metadata</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-neutral-400">{c.id}</TableCell>
                  <TableCell className="font-mono text-sm">{c.code}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{getGroupName(c.groupId)}</TableCell>
                  <TableCell>
                    <span className="text-xs text-neutral-500">
                      {getMetadataDisplay(c)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }
                    >
                      {c.active ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => openEditForm(c)}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(c)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-neutral-400"
                  >
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredCategories.map((c) => (
          <div
            key={c.id}
            className="border rounded-lg p-3 bg-white hover:bg-neutral-50 transition"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-neutral-500">
                    {c.code}
                  </span>
                  <Badge
                    className={`text-[10px] ${
                      c.active
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="font-medium text-sm text-neutral-900 truncate">
                  {c.name}
                </div>
                <div className="text-xs text-neutral-500 truncate mt-0.5">
                  {getGroupName(c.groupId)}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  {getMetadataDisplay(c)}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-md hover:bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <MoreVertical className="w-4 h-4 text-neutral-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditForm(c)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(c)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-neutral-400 text-sm">
            No categories found
          </div>
        )}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Category Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g. HALL-A-D1"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Category Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Hall A - Day 1"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Category Group *</Label>
              <Select
                value={formData.groupId}
                onValueChange={(v) => setFormData({ ...formData, groupId: v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select category group" />
                </SelectTrigger>
                <SelectContent>
                  {categoryGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.groupName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(v) => setFormData({ ...formData, active: v })}
              />
              <Label className="text-sm">Active</Label>
            </div>

            {/* Metadata */}
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
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10"
            >
              {editingCategory ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
