"use client";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api-client";
import { useEffect, useState } from "react";

export function DebugEnv() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [session, setSession] = useState<any>(null);
  const [serverSession, setServerSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get environment variables
        const envData: Record<string, string> = {};
        if (typeof window !== "undefined") {
          envData.NEXT_PUBLIC_SERVER_URL =
            process.env.NEXT_PUBLIC_SERVER_URL || "Not set";
        }

        // Get client session data
        const sessionData = await authClient.getSession();

        // Test server session using the centralized API client
        let serverSessionData = null;
        try {
          const response = await api.get("/test-session");
          serverSessionData = response.data;
        } catch (error) {
          console.error("Error testing server session:", error);
          serverSessionData = { error: "Failed to connect to server" };
        }

        setEnvVars(envData);
        setSession(sessionData);
        setServerSession(serverSessionData);
      } catch (error) {
        console.error("Error fetching debug data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Debug Information</h3>

      <div className="mb-2">
        <strong>Environment Variables:</strong>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key}>
            {key}: {value}
          </div>
        ))}
      </div>

      <div className="mb-2">
        <strong>Current URL:</strong>
        <div>
          {typeof window !== "undefined" ? window.location.href : "Server side"}
        </div>
      </div>

      <div className="mb-2">
        <strong>API Test URL:</strong>
        <div>{envVars.NEXT_PUBLIC_SERVER_URL}/api/ai</div>
      </div>

      <div className="mb-2">
        <strong>Client Session Status:</strong>
        <div>Authenticated: {session && "user" in session ? "Yes" : "No"}</div>
        {session && "user" in session && (
          <div>
            User: {session.user.name} ({session.user.email})
          </div>
        )}
      </div>

      <div className="mb-2">
        <strong>Server Session Status:</strong>
        <div>Authenticated: {serverSession?.authenticated ? "Yes" : "No"}</div>
        {serverSession?.authenticated && (
          <div>
            User: {serverSession.user.name} ({serverSession.user.email})
          </div>
        )}
        {serverSession?.message && (
          <div className="text-red-400">Error: {serverSession.message}</div>
        )}
        {serverSession?.error && (
          <div className="text-red-400">Error: {serverSession.error}</div>
        )}
      </div>

      <div className="mb-2">
        <strong>Client Session Data:</strong>
        <pre className="text-xs overflow-auto max-h-20">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mb-2">
        <strong>Server Session Data:</strong>
        <pre className="text-xs overflow-auto max-h-20">
          {JSON.stringify(serverSession, null, 2)}
        </pre>
      </div>
    </div>
  );
}
