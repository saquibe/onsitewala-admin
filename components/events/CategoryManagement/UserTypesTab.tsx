// components/events/CategoryManagement/UserTypesTab.tsx
"use client";

import { useState } from "react";
import { Save, Edit, Trash2, Plus, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      {/* Add Form - Responsive */}
      <div className="mb-4">
        <Label className="text-xs text-neutral-500 mb-1 block">
          Add New User Type
        </Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="e.g. Student, International Delegate"
            className="flex-1 h-10"
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
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
              {userTypes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-neutral-400"
                  >
                    No user types found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {userTypes.map((ut) => (
          <div
            key={ut.id}
            className="border rounded-lg p-3 bg-white hover:bg-neutral-50 transition flex items-center justify-between gap-2"
          >
            <div className="font-medium text-sm text-neutral-900 truncate flex-1">
              {ut.typeName}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-md hover:bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <MoreVertical className="w-4 h-4 text-neutral-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(ut)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDelete(ut)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        {userTypes.length === 0 && (
          <div className="text-center py-12 text-neutral-400 text-sm">
            No user types found
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Edit User Type
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Type Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter user type name"
                className="h-10"
                onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
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
