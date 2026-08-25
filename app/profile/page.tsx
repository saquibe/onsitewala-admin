// app/profile/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { authApi } from "@/lib/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  User,
  Shield,
  Calendar,
  Camera,
  Loader2,
  CheckCircle,
  Edit2,
  Save,
  AlertCircle,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        mobile: user.mobile || "",
      });
      if (user.profileImage) {
        setPreviewImage(user.profileImage);
      }
    }
  }, [user]);

  const getUserInitials = () => {
    const fullName = formData.fullName || user?.fullName || "";

    if (!fullName || fullName.trim() === "") {
      return "A";
    }

    const nameParts = fullName.trim().split(" ");

    if (nameParts.length >= 2) {
      const first = nameParts[0]?.[0] || "";
      const second = nameParts[1]?.[0] || "";
      return `${first}${second}`.toUpperCase() || "A";
    }

    return (nameParts[0]?.[0] || "A").toUpperCase();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.mobile?.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      if (
        !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type,
        )
      ) {
        toast({
          title: "Error",
          description: "Please upload a valid image (JPEG, PNG, GIF, or WEBP)",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        fullName: formData.fullName,
        mobile: formData.mobile,
      };

      // If there's a selected file, include it in the update
      if (selectedFile) {
        updateData.profileImage = selectedFile;
      }

      // Update profile with all data in one request
      const updatedUser = await authApi.updateProfile(updateData);

      setUser(updatedUser);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsEditing(false);
      setSelectedFile(null);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        mobile: user.mobile || "",
      });
      if (user.profileImage) {
        setPreviewImage(user.profileImage);
      } else {
        setPreviewImage(null);
      }
    }
    setSelectedFile(null);
    setErrors({});
    setIsEditing(false);
  };

  const handleRemoveImage = async () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      // Send empty string to remove image
      const updatedUser = await authApi.updateProfile({
        profileImage: "",
      });
      if (updatedUser) {
        setUser(updatedUser);
      }
      toast({
        title: "Success",
        description: "Profile image removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const handleGoToDashboard = () => {
    router.push("/events");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">User Not Found</h3>
              <p className="text-sm text-neutral-500 mt-2">
                Please login again to access your profile.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="mt-4 bg-orange-600 hover:bg-orange-700"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={handleGoToDashboard}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
            <p className="text-sm text-neutral-500">
              {isEditing
                ? "Edit your account settings"
                : "View your account information"}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <Button
                onClick={handleGoToDashboard}
                variant="outline"
                className="hidden sm:flex"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-2 border-neutral-200">
                {previewImage ? (
                  <AvatarImage
                    src={previewImage}
                    alt={formData.fullName || "User"}
                  />
                ) : (
                  <AvatarFallback className="bg-orange-500 text-white text-2xl font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditing && (
                <>
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 p-1.5 bg-orange-600 rounded-full cursor-pointer hover:bg-orange-700 transition shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                    <input
                      ref={fileInputRef}
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {isEditing ? (
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`text-2xl font-bold h-auto py-1 px-2 ${errors.fullName ? "border-red-500" : ""}`}
                    placeholder="Enter your full name"
                  />
                ) : (
                  user.fullName || "User"
                )}
              </CardTitle>
              {!isEditing && (
                <p className="text-sm text-neutral-500 capitalize">
                  {user.role || "User"}
                </p>
              )}
              {isEditing && errors.fullName && (
                <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email (readonly) */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Mail className="w-5 h-5 text-neutral-400" />
                <div className="flex-1">
                  <div className="text-xs text-neutral-500">Email</div>
                  <div className="text-sm font-medium">
                    {user.email || "N/A"}
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>

              {/* Mobile */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Phone className="w-5 h-5 text-neutral-400" />
                <div className="flex-1">
                  <div className="text-xs text-neutral-500">Mobile</div>
                  {isEditing ? (
                    <Input
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={`text-sm h-auto py-0.5 px-1 ${errors.mobile ? "border-red-500" : ""}`}
                      placeholder="Enter mobile number"
                    />
                  ) : (
                    <div className="text-sm font-medium">
                      {user.mobile || "N/A"}
                    </div>
                  )}
                  {isEditing && errors.mobile && (
                    <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
                  )}
                </div>
              </div>

              {/* Role (readonly) */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Shield className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-xs text-neutral-500">Role</div>
                  <div className="text-sm font-medium capitalize">
                    {user.role || "N/A"}
                  </div>
                </div>
              </div>

              {/* Status (readonly) */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <User className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-xs text-neutral-500">Status</div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        user.status === "active"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div className="text-sm font-medium capitalize">
                      {user.status || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Login (readonly) */}
            {user.lastLoginAt && (
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Calendar className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-xs text-neutral-500">Last Login</div>
                  <div className="text-sm font-medium">
                    {new Date(user.lastLoginAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Dashboard Button at bottom (mobile) */}
            <div className="pt-4 border-t sm:hidden">
              <Button
                onClick={handleGoToDashboard}
                variant="outline"
                className="w-full"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
