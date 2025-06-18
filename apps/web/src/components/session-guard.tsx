"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "./loader";

interface SessionGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function SessionGuard({
  children,
  requireAuth = true,
  redirectTo = "/login",
}: SessionGuardProps) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect if we're not already redirecting and session is definitely null
    if (!isPending && session === null && requireAuth && !hasRedirected) {
      setHasRedirected(true);
      router.push(redirectTo);
    }
  }, [session, isPending, requireAuth, redirectTo, router, hasRedirected]);

  // Show loading while session is being determined
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // If auth is required and no session, show loading while redirecting
  if (requireAuth && session === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader />
          <p className="mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If auth is required and session exists but no user, show loading
  if (requireAuth && session && !session.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader />
          <p className="mt-2">Loading session...</p>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}
