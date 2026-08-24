// app/profile/page.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, User, Calendar, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-10">Loading...</div>;
  }

  const getUserInitials = () => {
    const nameParts = user.fullName?.split(" ") || ["A"];
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
          <p className="text-sm text-neutral-500">
            Manage your account settings
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-orange-500 text-white text-2xl font-medium">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.fullName}</CardTitle>
              <p className="text-sm text-neutral-500">{user.role}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Mail className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-xs text-neutral-500">Email</div>
                  <div className="text-sm font-medium">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Phone className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-xs text-neutral-500">Mobile</div>
                  <div className="text-sm font-medium">{user.mobile}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Shield className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-xs text-neutral-500">Role</div>
                  <div className="text-sm font-medium capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <User className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-xs text-neutral-500">Status</div>
                  <div className="text-sm font-medium capitalize">
                    {user.status}
                  </div>
                </div>
              </div>
            </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
