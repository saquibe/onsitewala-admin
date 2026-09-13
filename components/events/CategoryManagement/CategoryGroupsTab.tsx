// components/events/CategoryManagement/CategoryGroupsTab.tsx
"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, MoreVertical } from "lucide-react";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { CategoryGroup } from "../types";

interface CategoryGroupsTabProps {
  categoryGroups: CategoryGroup[];
  onAdd: (group: Omit<CategoryGroup, "id">) => void;
  onUpdate: (id: string, data: Partial<CategoryGroup>) => void;
  onDelete: (id: string) => void;
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
  const [newGroup, setNewGroup] = useState({ groupName: "", description: "" });
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [editData, setEditData] = useState({ groupName: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdd = () => {
    if (newGroup.groupName.trim()) {
      if (
        categoryGroups.some(
          (g) =>
            g.groupName.toLowerCase() ===
            newGroup.groupName.trim().toLowerCase(),
        )
      ) {
        toast({
          title: "Error",
          description: "Category group with this name already exists",
          variant: "destructive",
        });
        return;
      }
      onAdd({
        groupName: newGroup.groupName.trim(),
        description: newGroup.description.trim() || undefined,
      });
      setNewGroup({ groupName: "", description: "" });
      toast({
        title: "Success",
        description: "Category group added successfully",
      });
    }
  };

  const handleEdit = (group: CategoryGroup) => {
    setEditingGroup(group);
    setEditData({
      groupName: group.groupName,
      description: group.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingGroup && editData.groupName.trim()) {
      if (
        categoryGroups.some(
          (g) =>
            g.groupName.toLowerCase() ===
              editData.groupName.trim().toLowerCase() &&
            g.id !== editingGroup.id,
        )
      ) {
        toast({
          title: "Error",
          description: "Category group with this name already exists",
          variant: "destructive",
        });
        return;
      }
      onUpdate(editingGroup.id, {
        groupName: editData.groupName.trim(),
        description: editData.description.trim() || undefined,
      });
      setIsDialogOpen(false);
      setEditingGroup(null);
      toast({
        title: "Success",
        description: "Category group updated successfully",
      });
    }
  };

  const handleDelete = (group: CategoryGroup) => {
    if (confirm(`Delete category group "${group.groupName}"?`)) {
      onDelete(group.id);
      toast({
        title: "Success",
        description: "Category group deleted successfully",
      });
    }
  };

  return (
    <div>
      {/* Add Form - Responsive */}
      <div className="mb-4">
        <Label className="text-xs text-neutral-500 mb-1 block">
          Add New Category Group
        </Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={newGroup.groupName}
            onChange={(e) =>
              setNewGroup({ ...newGroup, groupName: e.target.value })
            }
            placeholder="Group name (e.g. Hall A, Day 1)"
            className="flex-1 h-10"
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
          />
          <Input
            value={newGroup.description}
            onChange={(e) =>
              setNewGroup({ ...newGroup, description: e.target.value })
            }
            placeholder="Description (optional)"
            className="flex-1 h-10"
          />
          <Button
            onClick={handleAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap h-10 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Group Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryGroups.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="text-neutral-400">{g.id}</TableCell>
                  <TableCell className="font-medium">{g.groupName}</TableCell>
                  <TableCell className="text-neutral-500">
                    {g.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleEdit(g)}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(g)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {categoryGroups.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-neutral-400"
                  >
                    No category groups found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {categoryGroups.map((g) => (
          <div
            key={g.id}
            className="border rounded-lg p-3 bg-white hover:bg-neutral-50 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-neutral-900 truncate">
                  {g.groupName}
                </div>
                {g.description && (
                  <div className="text-xs text-neutral-500 mt-0.5 truncate">
                    {g.description}
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-md hover:bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <MoreVertical className="w-4 h-4 text-neutral-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(g)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(g)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        {categoryGroups.length === 0 && (
          <div className="text-center py-12 text-neutral-400 text-sm">
            No category groups found
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Edit Category Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Group Name</Label>
              <Input
                value={editData.groupName}
                onChange={(e) =>
                  setEditData({ ...editData, groupName: e.target.value })
                }
                placeholder="Enter group name"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                placeholder="Enter description (optional)"
                rows={2}
              />
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
              onClick={handleSaveEdit}
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
