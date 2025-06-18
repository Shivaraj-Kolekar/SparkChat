"use client";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api-client";
import { useEffect, useState } from "react";

export function DebugEnv() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [session, setSession] = useState<any>(null);
  const [serverSession, setServerSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const errorLog: string[] = [];

      try {
        // Get environment variables
        const envData: Record<string, string> = {};
        if (typeof window !== "undefined") {
          envData.NEXT_PUBLIC_SERVER_URL =
            process.env.NEXT_PUBLIC_SERVER_URL || "Not set";

          // Check if critical env vars are missing
          if (!process.env.NEXT_PUBLIC_SERVER_URL) {
            errorLog.push("NEXT_PUBLIC_SERVER_URL is not set");
          }
        }

        // Get client session data
        let sessionData = null;
        try {
          sessionData = await authClient.getSession();
        } catch (error) {
          errorLog.push(`Client session error: ${error}`);
        }

        // Test server session using the centralized API client
        let serverSessionData = null;
        try {
          const response = await api.get("/api/test-session");
          serverSessionData = response.data;
        } catch (error: any) {
          const errorMsg = error.response?.status
            ? `Server session error: ${error.response.status} - ${error.response.statusText}`
            : `Server connection error: ${error.message}`;
          errorLog.push(errorMsg);
          serverSessionData = { error: errorMsg };
        }

        // Test basic API connectivity
        try {
          const healthCheck = await api.get("/api/ai");
          console.log("Health check response:", healthCheck.status);
        } catch (error: any) {
          errorLog.push(`API health check failed: ${error.message}`);
        }

        setEnvVars(envData);
        setSession(sessionData);
        setServerSession(serverSessionData);
        setErrors(errorLog);
      } catch (error: any) {
        errorLog.push(`General error: ${error.message}`);
        setErrors(errorLog);
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
          <div key={key} className={value === "Not set" ? "text-red-400" : ""}>
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

      {errors.length > 0 && (
        <div className="mb-2">
          <strong className="text-red-400">Errors Found:</strong>
          {errors.map((error, index) => (
            <div key={index} className="text-red-400 text-xs">
              • {error}
            </div>
          ))}
        </div>
      )}

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
