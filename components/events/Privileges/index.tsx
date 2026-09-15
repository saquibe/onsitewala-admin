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
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  UserCircle,
  Layers,
} from "lucide-react";
import type { RegDataType, Category, CategoryPermission } from "../types";

interface PrivilegesProps {
  userTypes: RegDataType[];
  categories: Category[];
  permissions: CategoryPermission[];
  onTogglePermission: (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => Promise<void>;
  onBulkAllowAll: (userTypeId: string) => Promise<void>;
  onBulkBlockAll: (userTypeId: string) => Promise<void>;
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
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());
  const [pendingBulk, setPendingBulk] = useState<Set<string>>(new Set());

  const isAllowed = (userTypeId: string, categoryId: string) => {
    return permissions.some(
      (p) =>
        p.userTypeId === userTypeId && p.categoryId === categoryId && p.allowed,
    );
  };

  const isTogglePending = (userTypeId: string, categoryId: string) =>
    pendingToggles.has(`${userTypeId}_${categoryId}`);

  const isBulkPending = (userTypeId: string) => pendingBulk.has(userTypeId);

  const handleToggle = async (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => {
    const key = `${userTypeId}_${categoryId}`;
    setPendingToggles((prev) => new Set(prev).add(key));
    try {
      await onTogglePermission(userTypeId, categoryId, allowed);
    } finally {
      setPendingToggles((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleBulk = async (userTypeId: string, action: "allow" | "block") => {
    setPendingBulk((prev) => new Set(prev).add(userTypeId));
    try {
      if (action === "allow") {
        await onBulkAllowAll(userTypeId);
      } else {
        await onBulkBlockAll(userTypeId);
      }
    } finally {
      setPendingBulk((prev) => {
        const next = new Set(prev);
        next.delete(userTypeId);
        return next;
      });
    }
  };

  const filteredUserTypes =
    filterType === "all"
      ? userTypes
      : userTypes.filter((ut) => ut._id === filterType);

  // ---------- Empty States ----------
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <Layers className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">
          No categories yet
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          Create categories first to manage permissions.
        </p>
      </div>
    );
  }

  if (userTypes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <UserCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">
          No user types yet
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          Add user types in the Category tab first.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            User Type × Category Permissions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            ✔ = allow, ✘ = block
          </p>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All User Types</SelectItem>
            {userTypes.map((ut) => (
              <SelectItem key={ut._id} value={ut._id}>
                {ut.regDataTypeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
          <p className="text-xs text-neutral-500 mt-3">
            Loading permissions...
          </p>
        </div>
      ) : (
        <>
          {/* ============================================ */}
          {/* DESKTOP — full matrix table */}
          {/* ============================================ */}
          <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50">
                  <TableHead className="min-w-[160px] sticky left-0 bg-neutral-50 z-20 align-top py-3">
                    User Type
                  </TableHead>
                  {categories.map((cat) => (
                    <TableHead
                      key={cat._id}
                      className="min-w-[140px] text-center align-top py-3"
                    >
                      <div className="text-xs font-semibold text-neutral-900">
                        {cat.categoryCode}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 whitespace-normal break-words leading-tight">
                        {cat.categoryName}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="min-w-[180px] text-center sticky right-0 bg-neutral-50 z-20 align-top py-3">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUserTypes.map((ut) => (
                  <TableRow key={ut._id}>
                    <TableCell className="font-medium sticky left-0 bg-white z-10 align-top py-3">
                      {ut.regDataTypeName}
                    </TableCell>
                    {categories.map((cat) => {
                      const allowed = isAllowed(ut._id, cat._id);
                      const pending = isTogglePending(ut._id, cat._id);
                      return (
                        <TableCell
                          key={cat._id}
                          className="text-center align-top py-3"
                        >
                          <Button
                            size="sm"
                            variant={allowed ? "default" : "outline"}
                            className={`w-[84px] h-8 text-xs ${
                              allowed ? "bg-green-600 hover:bg-green-700" : ""
                            }`}
                            onClick={() =>
                              handleToggle(ut._id, cat._id, !allowed)
                            }
                            disabled={pending}
                          >
                            {pending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : allowed ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" /> Allow
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" /> Block
                              </>
                            )}
                          </Button>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center sticky right-0 bg-white z-10 align-top py-3">
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 text-xs h-8"
                          onClick={() => handleBulk(ut._id, "allow")}
                          disabled={isBulkPending(ut._id)}
                        >
                          {isBulkPending(ut._id) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Allow all"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 text-xs h-8"
                          onClick={() => handleBulk(ut._id, "block")}
                          disabled={isBulkPending(ut._id)}
                        >
                          {isBulkPending(ut._id) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Block all"
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ============================================ */}
          {/* MOBILE — card per user type */}
          {/* ============================================ */}
          <div className="md:hidden space-y-4">
            {filteredUserTypes.map((ut) => {
              const bulkPending = isBulkPending(ut._id);
              return (
                <div
                  key={ut._id}
                  className="border rounded-lg overflow-hidden bg-white"
                >
                  {/* User Type header */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-neutral-50 border-b">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="font-semibold text-sm text-neutral-900 truncate">
                        {ut.regDataTypeName}
                      </span>
                    </div>
                  </div>

                  {/* Bulk actions */}
                  <div className="flex gap-2 p-2 border-b bg-neutral-50/50">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 text-xs h-8 flex-1"
                      onClick={() => handleBulk(ut._id, "allow")}
                      disabled={bulkPending}
                    >
                      {bulkPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Allow all
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 text-xs h-8 flex-1"
                      onClick={() => handleBulk(ut._id, "block")}
                      disabled={bulkPending}
                    >
                      {bulkPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Block all
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Categories list */}
                  <div className="divide-y">
                    {categories.map((cat) => {
                      const allowed = isAllowed(ut._id, cat._id);
                      const pending = isTogglePending(ut._id, cat._id);
                      return (
                        <div
                          key={cat._id}
                          className="flex items-center justify-between gap-3 p-3 hover:bg-neutral-50"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-[10px] text-neutral-500">
                                {cat.categoryCode}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 h-4"
                              >
                                {cat.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </Badge>
                            </div>
                            <div className="text-sm text-neutral-800 break-words leading-snug">
                              {cat.categoryName}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={allowed ? "default" : "outline"}
                            className={`w-[84px] h-8 text-xs flex-shrink-0 ${
                              allowed ? "bg-green-600 hover:bg-green-700" : ""
                            }`}
                            onClick={() =>
                              handleToggle(ut._id, cat._id, !allowed)
                            }
                            disabled={pending}
                          >
                            {pending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : allowed ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" /> Allow
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" /> Block
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
