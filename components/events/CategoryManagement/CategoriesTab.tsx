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

// Pre-defined options for scalability
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

  // Form state
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
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name..."
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-40">
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
        >
          <X className="w-4 h-4 mr-1" /> Clear
        </Button>
      </div>

      {/* Categories Table */}
      <div className="border rounded-lg overflow-hidden">
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
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g. HALL-A-D1"
                />
              </div>
              <div className="space-y-2">
                <Label>Category Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Hall A - Day 1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category Group *</Label>
              <Select
                value={formData.groupId}
                onValueChange={(v) => setFormData({ ...formData, groupId: v })}
              >
                <SelectTrigger>
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
              <Label>Active</Label>
            </div>

            {/* Metadata - Scalable fields */}
            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium text-neutral-800 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Metadata (Optional - for organizing days, halls, sessions)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    Day
                  </Label>
                  <Select
                    value={formData.day}
                    onValueChange={(v) => setFormData({ ...formData, day: v })}
                  >
                    <SelectTrigger>
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
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    Hall / Room
                  </Label>
                  <Select
                    value={formData.hall}
                    onValueChange={(v) => setFormData({ ...formData, hall: v })}
                  >
                    <SelectTrigger>
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
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    Session / Time
                  </Label>
                  <Input
                    value={formData.session}
                    onChange={(e) =>
                      setFormData({ ...formData, session: e.target.value })
                    }
                    placeholder="e.g. Morning Session, 10:00 AM"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Slot</Label>
                  <Input
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g. 10:00 - 12:00"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {editingCategory ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
