// hooks/use-auth.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, User } from "@/lib/api";
import Cookies from "js-cookie";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Don't logout here, let the API interceptor handle it
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user, accessToken } = await authApi.login({ email, password });
    Cookies.set("accessToken", accessToken, { expires: 1 });
    setUser(user);
    return { user, accessToken };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("accessToken");
      setUser(null);
      router.push("/");
    }
  };

  const resetPassword = async (data: {
    token: string;
    newPassword: string;
  }) => {
    await authApi.resetPassword(data);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword({ email });
  };

  return {
    user,
    isLoading,
    login,
    logout,
    resetPassword,
    forgotPassword,
  };
}
