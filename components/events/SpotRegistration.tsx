// components/events/SpotRegistration.tsx
"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  CheckCircle,
  XCircle as XCircleIcon,
  Printer,
  Save,
  User,
  Mail,
  Phone,
  IdCard,
  FileText,
  Tag,
  CreditCard,
  MapPin,
  Building2,
  Globe,
  MapPinned,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type {
  PrintUser,
  RegDataType,
  Category,
  CategoryGroup,
  CategoryPermission,
} from "./types";

interface SpotRegistrationProps {
  users: PrintUser[];
  userTypes: RegDataType[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  permissions: CategoryPermission[];
  onAddUser: (
    user: Omit<PrintUser, "id" | "printed" | "userTypeName">,
    userPermissions: CategoryPermission[],
  ) => void;
  onTogglePermission: (
    userTypeId: string,
    categoryId: string,
    allowed: boolean,
  ) => void;
  onBulkAllowAll: (userTypeId: string, categoryIds: string[]) => void;
  onBulkBlockAll: (userTypeId: string, categoryIds: string[]) => void;
  onPrintBadge: (userId: string) => void;
  loading?: boolean;
}

export function SpotRegistration({
  users,
  userTypes,
  categories,
  categoryGroups,
  permissions,
  onAddUser,
  onTogglePermission,
  onBulkAllowAll,
  onBulkBlockAll,
  onPrintBadge,
  loading = false,
}: SpotRegistrationProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentUsers, setRecentUsers] = useState<PrintUser[]>([]);
  const [selectedUserTypeId, setSelectedUserTypeId] = useState("");
  const [formPermissions, setFormPermissions] = useState<CategoryPermission[]>(
    [],
  );

  const [formData, setFormData] = useState({
    registrationNo: "",
    userTypeId: "",
    email: "",
    fullName: "",
    phone: "",
    imcNumber: "",
    note: "",
    reference: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  // Auto-generate registration number
  useEffect(() => {
    generateRegistrationNo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const generateRegistrationNo = () => {
    const spotUsers = users.filter((u) => u.registrationNo.startsWith("SPOT-"));
    const maxNum = spotUsers.reduce((max, u) => {
      const num = parseInt(u.registrationNo.replace("SPOT-", ""), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const nextNum = (maxNum + 1).toString().padStart(4, "0");
    setFormData((prev) => ({ ...prev, registrationNo: `SPOT-${nextNum}` }));
  };

  // Group categories by groupCategoryId
  const groupedCategories = categories.reduce(
    (acc, cat) => {
      const group = cat.groupCategoryId || "Uncategorized";
      if (!acc[group]) acc[group] = [];
      acc[group].push(cat);
      return acc;
    },
    {} as Record<string, Category[]>,
  );

  const getGroupName = (groupId: string) =>
    categoryGroups.find((g) => g._id === groupId)?.groupCategoryName ||
    "Uncategorized";

  const searchResults = searchQuery
    ? users.filter((u) => {
        const search = searchQuery.toLowerCase();
        return (
          u.registrationNo.toLowerCase().includes(search) ||
          u.fullName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.phone.toLowerCase().includes(search)
        );
      })
    : [];

  const handleUserTypeChange = (value: string) => {
    setSelectedUserTypeId(value);
    setFormData({ ...formData, userTypeId: value });
    // Load existing permissions for this user type
    const userPermissions = permissions.filter((p) => p.userTypeId === value);
    setFormPermissions(userPermissions);
  };

  const isPermissionAllowed = (userTypeId: string, categoryId: string) => {
    return formPermissions.some(
      (p) =>
        p.userTypeId === userTypeId && p.categoryId === categoryId && p.allowed,
    );
  };

  const handleTogglePermission = (categoryId: string) => {
    if (!selectedUserTypeId) return;
    const current = isPermissionAllowed(selectedUserTypeId, categoryId);
    const newPermissions = current
      ? formPermissions.filter(
          (p) =>
            !(
              p.userTypeId === selectedUserTypeId && p.categoryId === categoryId
            ),
        )
      : [
          ...formPermissions,
          { userTypeId: selectedUserTypeId, categoryId, allowed: true },
        ];
    setFormPermissions(newPermissions);
    onTogglePermission(selectedUserTypeId, categoryId, !current);
  };

  const handleBulkAllow = (categoryIds: string[]) => {
    if (!selectedUserTypeId) return;
    const newPermissions = [...formPermissions];
    categoryIds.forEach((catId) => {
      const existing = newPermissions.find(
        (p) => p.userTypeId === selectedUserTypeId && p.categoryId === catId,
      );
      if (existing) {
        existing.allowed = true;
      } else {
        newPermissions.push({
          userTypeId: selectedUserTypeId,
          categoryId: catId,
          allowed: true,
        });
      }
    });
    setFormPermissions(newPermissions);
    onBulkAllowAll(selectedUserTypeId, categoryIds);
  };

  const handleBulkBlock = (categoryIds: string[]) => {
    if (!selectedUserTypeId) return;
    const newPermissions = formPermissions.filter(
      (p) =>
        !(
          p.userTypeId === selectedUserTypeId &&
          categoryIds.includes(p.categoryId)
        ),
    );
    setFormPermissions(newPermissions);
    onBulkBlockAll(selectedUserTypeId, categoryIds);
  };

  const validateForm = (): boolean => {
    if (
      !formData.registrationNo ||
      !formData.userTypeId ||
      !formData.fullName
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in Registration No, User Type, and Full Name",
        variant: "destructive",
      });
      return false;
    }

    const existing = users.find(
      (u) =>
        u.registrationNo.toLowerCase() ===
        formData.registrationNo.toLowerCase(),
    );
    if (existing) {
      toast({
        title: "Duplicate Registration",
        description: `Registration number ${formData.registrationNo} already exists`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const resetForm = () => {
    const currentUserType = formData.userTypeId;
    setFormData({
      registrationNo: "",
      userTypeId: currentUserType,
      email: "",
      fullName: "",
      phone: "",
      imcNumber: "",
      note: "",
      reference: "",
      address: "",
      city: "",
      state: "",
      country: "",
    });
    setSelectedUserTypeId(currentUserType);
    setTimeout(() => generateRegistrationNo(), 100);
  };

  const handleRegisterAndPrint = () => {
    if (!validateForm()) return;

    onAddUser(formData, formPermissions);

    const newUser: PrintUser = {
      ...formData,
      id: `temp_${Date.now()}`,
      printed: false,
      userTypeName:
        userTypes.find((ut) => ut._id === formData.userTypeId)
          ?.regDataTypeName || "",
      permissions: formPermissions,
    };

    setRecentUsers([newUser, ...recentUsers.slice(0, 9)]);

    toast({
      title: "Registered Successfully",
      description: `${formData.fullName} has been registered. Ready to print badge.`,
    });

    resetForm();
  };

  const handleRegisterOnly = () => {
    if (!validateForm()) return;

    onAddUser(formData, formPermissions);

    const newUser: PrintUser = {
      ...formData,
      id: `temp_${Date.now()}`,
      printed: false,
      userTypeName:
        userTypes.find((ut) => ut._id === formData.userTypeId)
          ?.regDataTypeName || "",
      permissions: formPermissions,
    };

    setRecentUsers([newUser, ...recentUsers.slice(0, 9)]);

    toast({
      title: "Registered Successfully",
      description: `${formData.fullName} has been registered.`,
    });

    resetForm();
  };

  const handleQuickPrint = (user: PrintUser) => {
    onPrintBadge(user.id);
    toast({
      title: "Printing",
      description: `Badge sent to printer for ${user.fullName}`,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* ============================================ */}
      {/* Search Existing Users */}
      {/* ============================================ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            Search Existing User
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Check if the person is already registered before adding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Reg No, Email, Name, or Phone..."
              className="pl-10 h-11"
            />
          </div>

          {searchQuery && (
            <div className="mt-3 border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="text-xs">Reg No</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-xs">
                          {user.registrationNo}
                        </TableCell>
                        <TableCell className="text-xs truncate max-w-[150px]">
                          {user.fullName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {user.userTypeName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleQuickPrint(user)}
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            Print
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center text-sm text-neutral-500">
                  No users found. Continue below to register new user.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Registration Form */}
      {/* ============================================ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            New Spot Registration
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Register a new attendee on the spot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Reg No + User Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                Registration No *
              </Label>
              <Input
                value={formData.registrationNo}
                onChange={(e) =>
                  setFormData({ ...formData, registrationNo: e.target.value })
                }
                placeholder="SPOT-0001"
                className="h-11 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-neutral-400" />
                User Type *
              </Label>
              <Select
                value={formData.userTypeId}
                onValueChange={handleUserTypeChange}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  {userTypes.length === 0 ? (
                    <div className="p-2 text-xs text-neutral-500 text-center">
                      No user types available
                    </div>
                  ) : (
                    userTypes.map((ut) => (
                      <SelectItem key={ut._id} value={ut._id}>
                        {ut.regDataTypeName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                Full Name *
              </Label>
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="John Doe"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@example.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                Phone
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 9876543210"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <IdCard className="w-3.5 h-3.5 text-neutral-400" />
                IMC Number
              </Label>
              <Input
                value={formData.imcNumber}
                onChange={(e) =>
                  setFormData({ ...formData, imcNumber: e.target.value })
                }
                placeholder="IMC123"
                className="h-11"
              />
            </div>
          </div>

          {/* ============================================ */}
          {/* NEW: Address Information (Optional) */}
          {/* ============================================ */}
          <div className="border-t pt-4">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Address Information (Optional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  Address
                </Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Street address, apartment, etc."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  City
                </Label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g. Mumbai"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <MapPinned className="w-3.5 h-3.5 text-neutral-400" />
                  State
                </Label>
                <Input
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="e.g. Maharashtra"
                  className="h-11"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-neutral-400" />
                  Country
                </Label>
                <Input
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="e.g. India"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  Reference
                </Label>
                <Input
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Reference"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Note</Label>
                <Input
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Additional notes..."
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* Category Permissions */}
          {/* ============================================ */}
          {selectedUserTypeId && (
            <div className="border-t pt-4 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="font-semibold text-sm text-neutral-900">
                  Category Permissions
                </h3>
                <span className="text-[10px] sm:text-xs text-neutral-500">
                  ✔ = allow, empty = block
                </span>
              </div>

              {categories.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  ⚠️ No categories yet. Create categories in the{" "}
                  <strong>Category</strong> tab first to manage permissions.
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(groupedCategories).map(
                    ([groupId, groupCats]) => (
                      <div
                        key={groupId}
                        className="border rounded-lg overflow-hidden"
                      >
                        <Accordion
                          type="single"
                          collapsible
                          defaultValue={groupId}
                        >
                          <AccordionItem value={groupId} className="border-0">
                            <div className="flex items-center justify-between p-2.5 bg-neutral-50">
                              <AccordionTrigger className="hover:no-underline py-0 flex-1 text-left">
                                <h4 className="font-medium text-xs sm:text-sm text-neutral-800">
                                  {getGroupName(groupId)}
                                </h4>
                              </AccordionTrigger>
                              <div className="flex gap-1.5 flex-shrink-0 ml-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 text-[10px] h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBulkAllow(
                                      groupCats.map((c) => c._id),
                                    );
                                  }}
                                >
                                  Allow all
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 text-[10px] h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBulkBlock(
                                      groupCats.map((c) => c._id),
                                    );
                                  }}
                                >
                                  Block all
                                </Button>
                              </div>
                            </div>
                            <AccordionContent className="pt-2 pb-0">
                              <div className="space-y-1 p-2">
                                {groupCats.map((cat) => {
                                  const allowed = isPermissionAllowed(
                                    selectedUserTypeId,
                                    cat._id,
                                  );
                                  return (
                                    <div
                                      key={cat._id}
                                      className="flex items-center justify-between py-1.5 px-2 hover:bg-neutral-50 rounded gap-2"
                                    >
                                      <span className="text-xs sm:text-sm text-neutral-700 flex-1 min-w-0 truncate">
                                        {cat.categoryName}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant={
                                          allowed ? "default" : "outline"
                                        }
                                        className={`w-[72px] sm:w-20 h-7 text-[10px] sm:text-xs flex-shrink-0 ${
                                          allowed
                                            ? "bg-green-600 hover:bg-green-700"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          handleTogglePermission(cat._id)
                                        }
                                      >
                                        {allowed ? (
                                          <>
                                            <CheckCircle className="w-3 h-3 mr-0.5" />
                                            Allow
                                          </>
                                        ) : (
                                          <>
                                            <XCircleIcon className="w-3 h-3 mr-0.5" />
                                            Block
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/* Action Buttons */}
          {/* ============================================ */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              type="button"
              onClick={handleRegisterAndPrint}
              className="bg-orange-600 hover:bg-orange-700 text-white h-11 flex-1 order-1 sm:order-2"
            >
              <Printer className="w-4 h-4 mr-2" />
              Register & Print Badge
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRegisterOnly}
              className="h-11 flex-1 order-2 sm:order-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Register Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Recently Registered */}
      {/* ============================================ */}
      {recentUsers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Recently Registered
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Users registered in this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 p-2.5 border rounded-lg hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-2">
                        <span className="font-mono">{user.registrationNo}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {user.userTypeName}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs flex-shrink-0"
                    onClick={() => handleQuickPrint(user)}
                  >
                    <Printer className="w-3 h-3 mr-1" />
                    Print
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
