import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MASTRA_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4111";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Obtém um JWT do Better Auth para repassar aos serviços backend.
 * O JWT é gerado server-side usando a sessão do cookie.
 */
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

function parseAISDKToMastra(params: any) {
  const messages =
    params.messages?.map((msg: any) => ({
      role: msg.role,
      content:
        msg.parts?.map((part: any) => {
          if (part.type === "file") {
            return {
              type: part.type,
              data: part.url,
              mediaType: part.mediaType,
            };
          }
          return {
            type: part.type,
            text: part.text,
          };
        }) || [],
    })) || [];

  return {
    id: params.id || crypto.randomUUID(),
    messages,
    trigger: params.trigger || "submit-message",
  };
}

export async function POST(req: Request) {
  const params = await req.json();

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieHeader = req.headers.get("cookie") || "";
    const token = await getJwtToken(cookieHeader);
    if (!token) {
      return NextResponse.json(
        { error: "Failed to generate auth token" },
        { status: 401 },
      );
    }

    const mastraPayload = parseAISDKToMastra(params);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${MASTRA_API_URL}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(mastraPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mastra API error:", response.status, errorText);
      throw new Error(`Mastra API error: ${response.status}`);
    }

    req.signal.addEventListener("abort", () => {
      console.log("## Client aborted the request ##");
    });

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error calling Mastra API:", error);
    return NextResponse.json(
      { error: "Failed to communicate with Mastra API" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const cookieHeader = req.headers.get("cookie") || "";
    const token = await getJwtToken(cookieHeader);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${MASTRA_API_URL}/agents/nutri-ia/memory?threadId=chat-${userId}&resourceId=${userId}`,
      { method: "GET", headers },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([]);
      }
      throw new Error(`Mastra API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.messages || []);
  } catch (error) {
    console.error("Error fetching messages from Mastra API:", error);
    return NextResponse.json([]);
  }
}
