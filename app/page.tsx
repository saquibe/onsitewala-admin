// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push("/events");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description:
          error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill demo credentials for convenience (optional)
  const fillDemoCredentials = () => {
    setEmail("asifsaascraft@gmail.com");
    setPassword("12345678");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 brand-gradient relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold">RegistrationTeam</div>
              <div className="text-xs text-white/60">by OnsiteWala</div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Manage your events
              <br />
              with confidence.
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              Badges, certificates, scanning and attendee data — all in one
              elegant admin panel built for event organizers.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-orange-400">120+</div>
                <div className="text-sm text-white/60">Events Managed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">50K+</div>
                <div className="text-sm text-white/60">Attendees Scanned</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">99.9%</div>
                <div className="text-sm text-white/60">Uptime</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-white/40">
            © 2025 OnsiteWala All rights reserved.
          </div>
        </div>
      </div>

      {/* Right - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="lg:hidden inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg">RegistrationTeam</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Welcome back
            </h2>
            <p className="text-neutral-500 mt-2">
              Sign in to your admin account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  disabled={loading || authLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs text-orange-600 hover:underline"
                  disabled={loading || authLoading}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  disabled={loading || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  disabled={loading || authLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300"
                  defaultChecked
                  disabled={loading || authLoading}
                />
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || authLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-11"
            >
              {loading || authLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Demo credentials helper - optional */}
            <div className="text-center">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs text-neutral-400 hover:text-neutral-600 underline"
                disabled={loading || authLoading}
              >
                Fill demo credentials
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-neutral-400">
            Demo: asifsaascraft@gmail.com / 12345678
          </div>
        </div>
      </div>
    </div>
  );
}
