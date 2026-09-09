// components/events/CategoryManagement/CategoryGroupsTab.tsx
"use client";

import { useState } from "react";
import { Save, Edit, Trash2, Plus, X } from "lucide-react";
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
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[300px]">
          <Label className="text-xs text-neutral-500 mb-1 block">
            Add New Category Group
          </Label>
          <div className="flex gap-2">
            <Input
              value={newGroup.groupName}
              onChange={(e) =>
                setNewGroup({ ...newGroup, groupName: e.target.value })
              }
              placeholder="Group name (e.g. Hall A, Day 1)"
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            />
            <Input
              value={newGroup.description}
              onChange={(e) =>
                setNewGroup({ ...newGroup, description: e.target.value })
              }
              placeholder="Description (optional)"
              className="flex-1"
            />
            <Button
              onClick={handleAdd}
              className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
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
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input
                value={editData.groupName}
                onChange={(e) =>
                  setEditData({ ...editData, groupName: e.target.value })
                }
                placeholder="Enter group name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
