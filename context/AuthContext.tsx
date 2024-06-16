"use client";

import { getUserInnerRoute, loginInnerRoute } from "@/API/auth";
import { TEmployee } from "@/types";
import { usePathname } from "next/navigation";
import React, { ReactNode, useEffect, useMemo, useState } from "react";

const LocalStorage_UserIdKey = "user-id-key";
const notAllowedUrlsForCashier = ["/categories", "/employees"];

type FetchType = {
  user: TEmployee | null;
  isAdmin: boolean;

  email: string;
  password: string;

  isLoading: boolean;
  isReady: boolean;
  error: string;

  setEmail: (v: string) => void;
  setPassword: (v: string) => void;

  handleLogin: () => void;
  handleLogout: () => void;
};

export const AuthContext = React.createContext<FetchType>({
  user: null,
  isAdmin: false,

  email: "",
  password: "",

  isLoading: false,
  isReady: false,
  error: "",

  setEmail: () => {},
  setPassword: () => {},

  handleLogin: () => {},
  handleLogout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  const [user, setUser] = useState<TEmployee | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = useMemo(
    () => !!user && user.empl_role === "Менеджер",
    [user]
  );

  useEffect(() => {
    (async () => {
      const userId = localStorage.getItem(LocalStorage_UserIdKey);
      if (!userId) return setIsLoading(false);

      const user = await getUserInnerRoute(userId);
      if (!user) return setIsLoading(false);

      setUser(user);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (user && pathname === "/") return window.open("/account", "_parent");
    if (!user && pathname !== "/") return window.open("/", "_parent") as any;
    if (!isAdmin && notAllowedUrlsForCashier.includes(pathname)) {
      return window.open("/account", "_parent");
    }
    if (!isReady) setIsReady(true);
  }, [isLoading, user, pathname]);

  const handleLogin = async () => {
    if (!email || !password) return;

    setIsLoading(true);

    const { status, user } = await loginInnerRoute(email, password);

    if (status === "error" || !user) {
      setError("Login Failed");
      setIsLoading(false);
      return;
    }

    localStorage.setItem(LocalStorage_UserIdKey, user.id_employee.toString());

    setUser(user);
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(LocalStorage_UserIdKey);
    window.open("/", "_parent");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,

        email,
        password,

        isLoading,
        isReady,
        error,

        setEmail,
        setPassword,

        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext<FetchType>(AuthContext);
