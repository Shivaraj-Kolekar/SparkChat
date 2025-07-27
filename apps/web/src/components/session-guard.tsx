"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "./loader";

interface SessionGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function SessionGuard({
  children,
  requireAuth = true,
  redirectTo = "https://assured-herring-21.accounts.dev/sign-up",
}: SessionGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && isLoaded && !user) {
      router.push(redirectTo);
    }
  }, [requireAuth, isLoaded, user, redirectTo, router]);

  if (requireAuth && !user) {
    return <Loader />;
  }

  return <>{children}</>;
}
