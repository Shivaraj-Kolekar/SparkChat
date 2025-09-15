import { db } from "@/db";
import { feedback } from "@/db/schema/db";
import { getClerkSession, getClerkUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ensureUserInDb } from "@/lib/ensureUserInDb";

// Allow requests from web client
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3001";

// Handle preflight OPTIONS requests
export const OPTIONS = async (req: NextRequest) => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
};

export const POST = async (req: NextRequest) => {
  console.log("Feedback POST request received");

  // Prepare CORS headers to be included in all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
  };

  try {
    // Authenticate the user
    const session = getClerkSession(req);
    const user = await getClerkUser(req);

    if (!session.userId || !user) {
      console.log("Unauthorized request - no valid user session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body));

    // Ensure the user exists in our database before proceeding
    await ensureUserInDb(user);

    console.log("User information:", {
      userId: user.id,

    });

    // Extract feedback content from request
    const content = body.feedback;

    // Validate input
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.log("Invalid feedback content:", content);
      return NextResponse.json(
        { error: "Feedback content is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (content.length > 5000) {
      console.log("Feedback content too long:", content.length);
      return NextResponse.json(
        { error: "Feedback content too long (max 5000 characters)" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Inserting feedback from user ${user.id}: ${content.substring(0, 50)}...`);

    // Insert the feedback into the database using the Clerk user ID
    // The ensureUserInDb function has already ensured this ID exists in our database
    console.log("Using userId for DB insert:", user.id);

    // Insert the feedback into the database
    await db.insert(feedback).values({
      userId: user.id,
      feedback: content,
    });

    console.log("Feedback inserted successfully");

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully"
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Error submitting feedback:", error);

    let errorMessage = "Failed to submit feedback";
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);

      // Always include error details for this specific issue
      if (error.message && error.message.includes("foreign key constraint")) {
        errorMessage = "User authentication issue. Please try logging out and back in.";
        // Log more details for debugging
        console.error("Foreign key constraint violation. User ID might not exist in the database or is in incorrect format.");
      }
      // In development, include more error details
      else if (process.env.NODE_ENV === 'development') {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
    }

    // Return error response
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
};
