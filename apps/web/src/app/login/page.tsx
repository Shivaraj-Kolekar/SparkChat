"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Sparkchat from "@/components/sparkchat";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="flex flex-col items-center gap-4 p-4">
        <Link href="/">
          <Button variant="secondary" className="mb-2">
            Back to Home
          </Button>
        </Link>
        <Image
          src="/sparkchat.png"
          alt="SparkChat Logo"
          width={72}
          height={72}
          className="rounded-full shadow"
        />
        <h1 className="text-2xl gap-1.5 inline-flex font-bold ">
          <p>Welcome to</p>
          <Sparkchat />
        </h1>
        <p className="text-muted-foreground  text-center max-w-xs">
          Sign in or sign up to start chatting with your personalized AI
          assistant.
        </p>
        <Tabs defaultValue="sign-in" className="w-full ">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <SignIn afterSignInUrl="/" />
          </TabsContent>
          <TabsContent value="sign-up">
            <SignUp afterSignUpUrl="/" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
