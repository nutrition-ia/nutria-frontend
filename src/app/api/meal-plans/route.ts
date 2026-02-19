import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const CATALOG_API_URL = process.env.CATALOG_API_URL || "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getJwtToken(cookieHeader: string): Promise<string | null> {
  try {
    const response = await fetch(`${APP_URL}/api/auth/token`, {
      headers: { cookie: cookieHeader },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.token || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const token = await getJwtToken(cookieHeader);
  if (!token) {
    return NextResponse.json(
      { error: "Failed to generate auth token" },
      { status: 401 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("page_size") || "10";

  try {
    const response = await fetch(
      `${CATALOG_API_URL}/api/v1/meal-plans?page=${page}&page_size=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plans" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const token = await getJwtToken(cookieHeader);
  if (!token) {
    return NextResponse.json(
      { error: "Failed to generate auth token" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${CATALOG_API_URL}/api/v1/meal-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to create meal plan" },
      { status: 500 },
    );
  }
}
