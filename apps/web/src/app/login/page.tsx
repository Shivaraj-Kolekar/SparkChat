"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Sparkchat from "@/components/sparkchat";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";


export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();

  const handleGoogleAuth = async () => {
    if (!signIn) return;

    setIsLoading(true);
    setError("");
try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/",
        redirectUrlComplete: "/",
      });
    } catch (error: any) {
      //console.error("Google auth error:", error);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        if (!signUp) return;

        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName: name.split(" ")[0] || "",
          lastName: name.split(" ")[1] || "",
        });

        if (result.status === "complete") {
          setSuccess("Account created successfully! Redirecting...");
          setTimeout(() => router.push("/"), 1000);
        } else {
          // Handle verification if needed
          await result.prepareEmailAddressVerification({ strategy: "email_code" });
          setSuccess("Please check your email for verification code.");
        }
      } else {
        if (!signIn) return;

        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === "complete") {
          setSuccess("Signed in successfully! Redirecting...");
          setTimeout(() => router.push("/"), 1000);
        }
      }
    } catch (error: any) {
      //console.error("Email auth error:", error);
      const errorMessage = error?.errors?.[0]?.message ||
                          error?.message ||
                          `Failed to ${isSignUp ? 'sign up' : 'sign in'}. Please try again.`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-white">

      <div className="w-full  flex items-center justify-center  min-h-screen">
        <div className="w-full max-w-md px-8 py-8">
          {/* Header */}


          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-8">
              <Image
                src="/sparkchat.png"
                alt="SparkChat Logo"
                width={64}
                height={64}
                className="rounded-full mx-auto shadow-lg"
              />
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Welcome to SparkChat
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Your personalized AI-powered chat application
            </p>
          </div>


          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500 bg-red-500/10 text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg border border-green-500 bg-green-500/10 text-green-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full bg-foreground text-secondary py-5  mb-8 font-medium text-base shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
           {isSignUp ? "Sign Up with Google" : "Sign In with Google"}
          </Button>



          {/* Toggle Sign In/Sign Up */}
          <div className="text-center mt-1">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
                setEmail("");
                setPassword("");
                setName("");
              }}
              className="text-sm text-gray-400 hover:text-blue-400 transition-colors font-medium"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
          {/* Footer */}
          <div className="text-center mt-10 space-y-4">
            {/*<div className="text-xs text-gray-500 leading-relaxed">
              <p>By continuing, you agree to our <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span> & <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span></p>
            </div>*/}

            {/* Back to Home Link */}
            <div>
              <Link href="/" className="text-sm text-gray-400 hover:text-blue-400 transition-colors font-medium inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
