// components/events/Privileges/index.tsx
"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import type { UserType, Category, CategoryPermission } from "../types";

interface PrivilegesProps {
  userTypes: UserType[];
  categories: Category[];
  permissions: CategoryPermission[];
  onTogglePermission: (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => void;
  onBulkAllowAll: (userTypeId: string) => void;
  onBulkBlockAll: (userTypeId: string) => void;
  loading?: boolean;
}

export function Privileges({
  userTypes,
  categories,
  permissions,
  onTogglePermission,
  onBulkAllowAll,
  onBulkBlockAll,
  loading = false,
}: PrivilegesProps) {
  const [filterType, setFilterType] = useState("all");

  const isAllowed = (userTypeId: string, categoryId: string) => {
    return permissions.some(
      (p) =>
        p.userTypeId === userTypeId && p.categoryId === categoryId && p.allowed,
    );
  };

  const filteredUserTypes =
    filterType === "all"
      ? userTypes
      : userTypes.filter((ut) => ut._id === filterType);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            User Type × Category Permissions
          </h2>
          <p className="text-sm text-neutral-500">✔ = allow, empty = block</p>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All User Types</SelectItem>
            {userTypes.map((ut) => (
              <SelectItem key={ut._id} value={ut._id}>
                {ut.userTypeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="min-w-[150px] sticky left-0 bg-neutral-50 z-10">
                User Type
              </TableHead>
              {categories.map((cat) => (
                <TableHead key={cat._id} className="min-w-[100px] text-center">
                  <div className="text-xs font-medium">{cat.categoryCode}</div>
                  <div className="text-xs text-neutral-500 truncate max-w-[80px]">
                    {cat.categoryName}
                  </div>
                </TableHead>
              ))}
              <TableHead className="min-w-[140px] text-center sticky right-0 bg-neutral-50 z-10">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUserTypes.map((ut) => (
              <TableRow key={ut._id}>
                <TableCell className="font-medium sticky left-0 bg-white z-10">
                  {ut.userTypeName}
                </TableCell>
                {categories.map((cat) => {
                  const allowed = isAllowed(ut._id, cat._id);
                  return (
                    <TableCell key={cat._id} className="text-center">
                      <Button
                        size="sm"
                        variant={allowed ? "default" : "outline"}
                        className={`w-20 ${allowed ? "bg-green-600 hover:bg-green-700" : ""}`}
                        onClick={() =>
                          onTogglePermission(ut._id, cat._id, !allowed)
                        }
                      >
                        {allowed ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Allow
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Block
                          </>
                        )}
                      </Button>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center sticky right-0 bg-white z-10">
                  <div className="flex gap-1 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 text-xs"
                      onClick={() => onBulkAllowAll(ut._id)}
                    >
                      Allow all
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 text-xs"
                      onClick={() => onBulkBlockAll(ut._id)}
                    >
                      Block all
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
