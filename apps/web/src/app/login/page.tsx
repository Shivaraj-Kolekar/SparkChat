"use client";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background flex-col gap-6">
      <Link href="/">
        <Button variant="outline" className="mb-2">
          Back to Home
        </Button>
      </Link>
      <SignIn afterSignInUrl="/" />
    </div>
  );
}
