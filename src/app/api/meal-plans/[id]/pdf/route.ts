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
  { params }: { params: Promise<{ id: string }> },
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

  const { id } = await params;

  try {
    const response = await fetch(
      `${CATALOG_API_URL}/api/v1/meal-plans/${id}/pdf`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": response.headers.get("Content-Disposition") ||
          'attachment; filename="plano-alimentar.pdf"',
      },
    });
  } catch (error) {
    console.error("Error exporting meal plan PDF:", error);
    return NextResponse.json(
      { error: "Failed to export meal plan PDF" },
      { status: 500 },
    );
  }
}
