// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast({
        title: "Email Sent",
        description: "Check your email for password reset link",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>

        <h2 className="text-2xl font-bold text-neutral-900">Reset Password</h2>
        <p className="text-neutral-500 mt-2">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {sent ? (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              If an account exists with that email, you will receive a password
              reset link shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-11"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
