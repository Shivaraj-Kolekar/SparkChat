"use client";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Sparkchat from "@/components/sparkchat";
import { useCallback } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const { signIn, isLoaded } = useSignIn();

  const handleOAuth = useCallback(
    (provider: "google" | "github") => async () => {
      if (!isLoaded) return;
      await signIn?.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: "/",
        redirectUrlComplete: "/",
      });
    },
    [signIn, isLoaded]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl shadow-xl w-full max-w-md border border-border
        bg-white/90 dark:bg-zinc-900/90 dark:border-zinc-800">
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
        <Tabs defaultValue="sign-in" className="w-full ">
          <TabsList className="w-full mb-4 bg-accent rounded-xl">
            <TabsTrigger value="sign-in" className="w-1/2">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up" className="w-1/2">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <Button
              className="w-full mb-3 py-6 text-base font-semibold flex items-center justify-center gap-2 bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-700 shadow-sm"
              onClick={handleOAuth("google")}
              variant="outline"
            >
              <FcGoogle className="text-2xl" />
              Sign in with Google
            </Button>
            <Button
              className="w-full py-6 text-base font-semibold flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 shadow-sm"
              onClick={handleOAuth("github")}
              variant="default"
            >
              <FaGithub className="text-2xl" />
              Sign in with GitHub
            </Button>
          </TabsContent>

          <TabsContent value="sign-up">
            <Button
              className="w-full mb-3 py-6 text-base font-semibold flex items-center justify-center gap-2 bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-700 shadow-sm"
              onClick={handleOAuth("google")}
              variant="outline"
            >
              <FcGoogle className="text-2xl" />
              Sign up with Google
            </Button>
            <Button
              className="w-full py-6 text-base font-semibold flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 shadow-sm"
              onClick={handleOAuth("github")}
              variant="default"
            >
              <FaGithub className="text-2xl" />
              Sign up with GitHub
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
