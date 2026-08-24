// app/reset-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Invalid reset token",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      toast({
        title: "Success",
        description: "Password reset successfully. Please login again.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8 text-center">
          <h2 className="text-xl font-bold text-neutral-900">
            Invalid Reset Link
          </h2>
          <p className="text-neutral-500 mt-2">
            The password reset link is invalid or has expired.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="mt-6 bg-orange-600 hover:bg-orange-700 text-white"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-neutral-900">
          Set New Password
        </h2>
        <p className="text-neutral-500 mt-2">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showPassword ? "Hide" : "Show"} password
          </button>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-11"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
