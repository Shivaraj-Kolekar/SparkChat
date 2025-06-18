"use client";

export function DebugEnv() {
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold">Debug Environment Variables</h3>
      <p>
        <strong>NEXT_PUBLIC_SERVER_URL:</strong>{" "}
        {process.env.NEXT_PUBLIC_SERVER_URL || "Not Set"}
      </p>
      <p>
        <strong>Current URL:</strong>{" "}
        {typeof window !== "undefined" ? window.location.origin : "Server"}
      </p>
      <p>
        <strong>API Test URL:</strong>{" "}
        {process.env.NEXT_PUBLIC_SERVER_URL
          ? `${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai`
          : "Not Set"}
      </p>
    </div>
  );
}
