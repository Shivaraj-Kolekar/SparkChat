import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    let dbStatus = "unknown";
    try {
      // Simple query to test database connection
      await db.execute("SELECT 1");
      dbStatus = "connected";
    } catch (error) {
      console.error("Database connection error:", error);
      dbStatus = "error";
    }

    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      CORS_ORIGIN: !!process.env.CORS_ORIGIN,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GITHUB_CLIENT_ID: !!process.env.GITHUB_CLIENT_ID,
      BETTER_AUTH_URL: !!process.env.BETTER_AUTH_URL,
    };
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: envCheck,
      headers: {
        host: request.headers.get("host"),
        origin: request.headers.get("origin"),
        referer: request.headers.get("referer"),
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )}}
