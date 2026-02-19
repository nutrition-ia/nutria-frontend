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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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
    const response = await fetch(
      `${CATALOG_API_URL}/api/v1/meal-plans/${params.id}`,
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
    console.error("Error fetching meal plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plan" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const response = await fetch(
      `${CATALOG_API_URL}/api/v1/meal-plans/${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to update meal plan" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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
    const response = await fetch(
      `${CATALOG_API_URL}/api/v1/meal-plans/${params.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    return NextResponse.json(
      { error: "Failed to delete meal plan" },
      { status: 500 },
    );
  }
}
