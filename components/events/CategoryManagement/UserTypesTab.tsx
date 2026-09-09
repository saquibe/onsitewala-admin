// components/events/CategoryManagement/UserTypesTab.tsx
"use client";

import { useState } from "react";
import { Save, Edit, Trash2, Plus, X } from "lucide-react";
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { UserType } from "../types";

interface UserTypesTabProps {
  userTypes: UserType[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function UserTypesTab({
  userTypes,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
}: UserTypesTabProps) {
  const { toast } = useToast();
  const [newTypeName, setNewTypeName] = useState("");
  const [editingType, setEditingType] = useState<UserType | null>(null);
  const [editName, setEditName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdd = () => {
    if (newTypeName.trim()) {
      // Check for duplicates
      if (
        userTypes.some(
          (ut) =>
            ut.typeName.toLowerCase() === newTypeName.trim().toLowerCase(),
        )
      ) {
        toast({
          title: "Error",
          description: "User type with this name already exists",
          variant: "destructive",
        });
        return;
      }
      onAdd(newTypeName.trim());
      setNewTypeName("");
      toast({ title: "Success", description: "User type added successfully" });
    }
  };

  const handleEdit = (type: UserType) => {
    setEditingType(type);
    setEditName(type.typeName);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingType && editName.trim()) {
      // Check for duplicates (excluding current)
      if (
        userTypes.some(
          (ut) =>
            ut.typeName.toLowerCase() === editName.trim().toLowerCase() &&
            ut.id !== editingType.id,
        )
      ) {
        toast({
          title: "Error",
          description: "User type with this name already exists",
          variant: "destructive",
        });
        return;
      }
      onUpdate(editingType.id, editName.trim());
      setIsDialogOpen(false);
      setEditingType(null);
      setEditName("");
      toast({
        title: "Success",
        description: "User type updated successfully",
      });
    }
  };

  const handleDelete = (type: UserType) => {
    if (confirm(`Delete user type "${type.typeName}"?`)) {
      onDelete(type.id);
      toast({
        title: "Success",
        description: "User type deleted successfully",
      });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-xs text-neutral-500 mb-1 block">
            Add New User Type
          </Label>
          <div className="flex gap-2">
            <Input
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="e.g. Student, International Delegate"
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
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
              <TableHead>Type Name</TableHead>
              <TableHead className="text-right w-48">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userTypes.map((ut) => (
              <TableRow key={ut.id}>
                <TableCell className="text-neutral-400">{ut.id}</TableCell>
                <TableCell className="font-medium">{ut.typeName}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleEdit(ut)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(ut)}
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
            <DialogTitle>Edit User Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter user type name"
                onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
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
