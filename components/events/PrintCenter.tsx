// components/events/PrintCenter.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Printer,
  Search,
  Download,
  Upload,
  XCircle,
  Filter,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { PrintUser, RegDataType } from "./types";
import { Checkbox } from "../ui/checkbox";
import { PrintPreviewDialog } from "./PrintPreviewDialog";

interface PrintCenterProps {
  users: PrintUser[];
  userTypes: RegDataType[];
  onPrintBadge: (userId: string) => void;
  onBulkPrint: (userIds: string[]) => void;
  onImportCSV: (file: File) => void;
  onExportCSV: () => void;
  loading?: boolean;
}

export function PrintCenter({
  users,
  userTypes,
  onPrintBadge,
  onBulkPrint,
  onImportCSV,
  onExportCSV,
  loading = false,
}: PrintCenterProps) {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [printPreviewUser, setPrintPreviewUser] = useState<PrintUser | null>(
    null,
  );
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    const search = searchQuery.toLowerCase();
    return (
      (u.registrationNo.toLowerCase().includes(search) ||
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)) &&
      (userTypeFilter === "all" || u.userTypeId === userTypeFilter)
    );
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportCSV(file);
  };

  const handleEditUser = (user: PrintUser) => {
    router.push(
      `/events/${eventId}/dashboard/spot-registration?edit=${user.id}`,
    );
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            Print Center
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Search users, filter, and print badges.
          </p>
        </div>
        {selectedUsers.length > 0 && (
          <Button
            onClick={() => onBulkPrint(selectedUsers)}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 sm:h-10"
            size="sm"
          >
            <Printer className="w-4 h-4 mr-1" /> Print ({selectedUsers.length})
          </Button>
        )}
      </div>

      {/* Mobile Search & Filter */}
      <div className="sm:hidden flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Desktop Search and Filters */}
      <div className="hidden sm:flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pl-10 h-10"
          />
        </div>
        <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
          <SelectTrigger className="w-48 h-10">
            <SelectValue placeholder="All user types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All user types</SelectItem>
            {userTypes.map((ut) => (
              <SelectItem key={ut._id} value={ut._id}>
                {ut.regDataTypeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setUserTypeFilter("all");
          }}
          className="gap-2 h-10"
        >
          <XCircle className="w-4 h-4" /> Clear
        </Button>
        <Button variant="outline" onClick={onExportCSV} className="gap-2 h-10">
          <Download className="w-4 h-4" /> Export
        </Button>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && (
        <div className="sm:hidden space-y-3 mb-4 p-3 bg-neutral-50 rounded-lg">
          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="All user types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All user types</SelectItem>
              {userTypes.map((ut) => (
                <SelectItem key={ut._id} value={ut._id}>
                  {ut.regDataTypeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setUserTypeFilter("all");
                setShowFilters(false);
              }}
              className="gap-2 h-10 flex-1"
            >
              <XCircle className="w-4 h-4" /> Clear
            </Button>
            <Button
              variant="outline"
              onClick={onExportCSV}
              className="gap-2 h-10 flex-1"
            >
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
          <label className="cursor-pointer block">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" className="gap-2 h-10 w-full" asChild>
              <span>
                <Upload className="w-4 h-4" /> Import CSV
              </span>
            </Button>
          </label>
        </div>
      )}

      {/* Users Table - Desktop */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="w-10 sticky left-0 bg-neutral-50">
                  <Checkbox
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onCheckedChange={() => {
                      if (selectedUsers.length === filteredUsers.length) {
                        setSelectedUsers([]);
                      } else {
                        setSelectedUsers(filteredUsers.map((u) => u.id));
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="min-w-[100px] sticky left-10 bg-neutral-50">
                  Reg No
                </TableHead>
                <TableHead className="min-w-[120px]">User Type</TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[180px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Phone</TableHead>
                <TableHead className="min-w-[100px]">IMC Number</TableHead>
                <TableHead className="min-w-[100px]">Note</TableHead>
                <TableHead className="min-w-[100px]">Reference</TableHead>
                <TableHead className="min-w-[180px] text-right sticky right-0 bg-neutral-50">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="sticky left-0 bg-white">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => {
                        setSelectedUsers((prev) =>
                          prev.includes(user.id)
                            ? prev.filter((id) => id !== user.id)
                            : [...prev, user.id],
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium sticky left-10 bg-white">
                    {user.registrationNo}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.userTypeName}</Badge>
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>{user.imcNumber || "-"}</TableCell>
                  <TableCell className="max-w-[100px] truncate">
                    {user.note || "-"}
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate">
                    {user.reference || "-"}
                  </TableCell>
                  <TableCell className="text-right sticky right-0 bg-white">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant={user.printed ? "default" : "outline"}
                        className={
                          user.printed
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }
                        onClick={() => {
                          setPrintPreviewUser(user);
                          setPrintPreviewOpen(true);
                        }}
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        {user.printed ? "Reprint" : "Print"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-12 text-neutral-400"
                  >
                    No users found. Register users from{" "}
                    <strong>Spot Registration</strong> or <strong>Data</strong>{" "}
                    tab first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="border rounded-lg p-3 bg-white hover:bg-neutral-50 transition"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={() => {
                  setSelectedUsers((prev) =>
                    prev.includes(user.id)
                      ? prev.filter((id) => id !== user.id)
                      : [...prev, user.id],
                  );
                }}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-neutral-900 truncate">
                    {user.registrationNo}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] flex-shrink-0 whitespace-nowrap"
                  >
                    {user.userTypeName}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-neutral-800 truncate">
                  {user.fullName}
                </div>
                {user.email && (
                  <div className="text-xs text-neutral-500 truncate mt-0.5">
                    {user.email}
                  </div>
                )}
                {user.phone && (
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant={user.printed ? "default" : "outline"}
                    className={`flex-1 h-9 text-xs ${
                      user.printed
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    onClick={() => {
                      setPrintPreviewUser(user);
                      setPrintPreviewOpen(true);
                    }}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    {user.printed ? "Reprint" : "Print"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 text-xs"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            No users found. Register users from{" "}
            <strong>Spot Registration</strong> or <strong>Data</strong> tab
            first.
          </div>
        )}
      </div>

      {/* Print Preview Dialog */}
      <PrintPreviewDialog
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        user={printPreviewUser}
        onConfirmPrint={(userId) => {
          onPrintBadge(userId);
          toast({
            title: "Sent to printer",
            description: `Badge sent for ${printPreviewUser?.fullName}`,
          });
        }}
      />
    </div>
  );
}
