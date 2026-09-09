// components/events/ScanCenter.tsx
"use client";

import { useState } from "react";
import {
  ScanLine,
  Search,
  ChevronLeft,
  CheckCircle,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import type { ScanCategory, ScanUser, UserType } from "./types";

interface ScanCenterProps {
  categories: ScanCategory[];
  users: ScanUser[];
  userTypes: UserType[];
  onScanUser: (userId: string, categoryId: string) => void;
  loading?: boolean;
}

export function ScanCenter({
  categories,
  users,
  userTypes,
  onScanUser,
  loading = false,
}: ScanCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [scanMode, setScanMode] = useState<"mobile" | "manual">("mobile");

  const filteredUsers = users.filter((u) => {
    const search = searchQuery.toLowerCase();
    return (
      (u.registrationNo.toLowerCase().includes(search) ||
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)) &&
      (userTypeFilter === "all" ||
        u.userTypeName ===
          userTypes.find((t) => t.id === userTypeFilter)?.typeName)
    );
  });

  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {/* Categories Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="font-bold text-neutral-900 mb-3">
            Choose a category below.
          </h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    cat.id === selectedCategory ? null : cat.id,
                  )
                }
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedCategory === cat.id
                    ? "bg-orange-50 border-2 border-orange-500"
                    : "bg-neutral-50 hover:bg-neutral-100"
                }`}
              >
                <div className="font-medium text-sm">{cat.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-neutral-500">{cat.group}</span>
                  <Badge variant="outline" className="text-xs">
                    #{cat.count}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scan Area */}
      <div className="lg:col-span-3">
        {selectedCategory ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  Scan – {selectedCategoryData?.name}
                </h2>
                <p className="text-sm text-neutral-500">
                  Group: {selectedCategoryData?.group}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            </div>

            <Tabs
              value={scanMode}
              onValueChange={(v) => setScanMode(v as "mobile" | "manual")}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Mobile scan
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Search className="w-4 h-4" /> Manual scan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mobile">
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-32 h-32 mx-auto bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
                      <Camera className="w-12 h-12 text-neutral-400" />
                    </div>
                    <h4 className="font-semibold text-neutral-900">
                      Focus here and scan QR
                    </h4>
                    <p className="text-sm text-neutral-500 mt-1">
                      Registration No
                    </p>
                    <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                      <p className="text-xs text-neutral-400">
                        Camera will open automatically
                      </p>
                      <Button className="mt-2 bg-orange-600 hover:bg-orange-700 text-white">
                        <ScanLine className="w-4 h-4 mr-2" /> Start Scanning
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Reg No, Email, Full Name, Phone"
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={userTypeFilter}
                    onValueChange={setUserTypeFilter}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All user types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All user types</SelectItem>
                      {userTypes.map((ut) => (
                        <SelectItem key={ut.id} value={ut.id}>
                          {ut.typeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50">
                        <TableHead>Reg No</TableHead>
                        <TableHead>User Type</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-center">
                          Scan Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.registrationNo}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.userTypeName}</Badge>
                          </TableCell>
                          <TableCell>{user.email || "-"}</TableCell>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.phone || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant={user.scanned ? "default" : "outline"}
                              className={
                                user.scanned
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }
                              onClick={() =>
                                onScanUser(user.id, selectedCategory)
                              }
                              disabled={user.scanned}
                            >
                              {user.scanned ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />{" "}
                                  Scanned
                                </>
                              ) : (
                                <>
                                  <ScanLine className="w-4 h-4 mr-1" /> Check
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <ScanLine className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900">
              Select a category to start scanning
            </h3>
            <p className="text-sm text-neutral-500 mt-2">
              Choose a category from the list on the left to begin scanning
              attendees.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
