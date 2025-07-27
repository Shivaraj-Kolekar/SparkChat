"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Sparkchat from "@/components/sparkchat";
import { SignIn, SignUp } from "@clerk/nextjs";

export default function LoginPage() {
  const [showSignUp, setShowSignUp] = React.useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl shadow-xl w-full max-w-md border border-border bg-white/90 dark:bg-zinc-900/90 dark:border-zinc-800">
        <Link href="/">
          <Button variant="secondary" className="mb-2 w-fit self-start">
            Back to Home
          </Button>
        </Link>
        <Image
          src="/sparkchat.png"
          alt="SparkChat Logo"
          width={80}
          height={80}
          className="rounded-full shadow-lg border-2 border-primary"
        />
        <h1 className="text-3xl gap-2 inline-flex font-bold items-center">
          <span>Welcome to</span>
          <Sparkchat />
        </h1>
        <p className="text-muted-foreground text-center max-w-xs text-base mb-2">
          Sign in or sign up to start chatting with your personalized AI assistant.
        </p>
        <div className="w-full space-y-6">
          {showSignUp ? (
            <SignUp path="/login" routing="path" signInUrl="/login" />
          ) : (
            <SignIn path="/login" routing="path" signUpUrl="/login" />
          )}
          <Button
            className="w-full mt-2"
            variant="outline"
            onClick={() => setShowSignUp((prev) => !prev)}
          >
            {showSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </div>
    </div>
  );
}
