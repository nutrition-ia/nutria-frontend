import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createHash } from 'crypto';

const MASTRA_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4111';

/**
 * Converte o ID do Better Auth (string) para um UUID v5 determinístico
 * Isso garante que o mesmo usuário sempre terá o mesmo UUID
 */
function betterAuthIdToUUID(betterAuthId: string): string {
  // Usa MD5 hash do ID para gerar um UUID v4-like
  const hash = createHash('md5').update(betterAuthId).digest('hex');

  // Formata como UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

function parseAISDKToMastra(params:  any) {
  const messages = params.messages?.map((msg: any) => ({
    role: msg.role,
    content: msg.parts?.map((part: any) => {
      if(part.type === "file"){
        console.log('📎 File detected:', {
          type: part.type,
          mediaType: part.mediaType,
          filename: part.filename,
          dataLength: part.url?.length || 0
        });
        return{
          type: part.type,
          data: part.url,  // AI SDK expects "data" field, not "url"
          mediaType: part.mediaType
        };
      }
     return {
        type: part.type,
        text: part.text
      };
    }) || []
  })) || [];

  return {
    id: params.id || crypto.randomUUID(),
    messages,
    trigger: params.trigger || "submit-message"
  };
}

export async function POST(req: Request) {
  const params = await req.json();

  try {
    // Pega a sessão do usuário autenticado
    const session = await auth.api.getSession({ headers: req.headers });
    const betterAuthUserId = session?.user?.id;
    const userEmail = session?.user?.email;

    // Converte Better Auth ID para UUID se existir
    const userId = betterAuthUserId ? betterAuthIdToUUID(betterAuthUserId) : undefined;

    console.log('👤 User session:', {
      betterAuthId: betterAuthUserId,
      uuid: userId,
      email: userEmail
    });

    const mastraPayload = parseAISDKToMastra(params);

    console.log('🚀 Sending to Mastra:', JSON.stringify({
      messageCount: mastraPayload.messages?.length,
      messages: mastraPayload.messages?.map((m: { role: string; content?: { type: string }[] }) => ({
        role: m.role,
        contentTypes: m.content?.map((c: { type: string }) => c.type)
      }))
    }, null, 2));

    // Monta os headers com X-User-Id e X-User-Email se o usuário estiver autenticado
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'accept': 'text/event-stream',
    };

    if (userId) {
      headers['X-User-Id'] = userId;
    }
    if (userEmail) {
      headers['X-User-Email'] = userEmail;
    }

    const response = await fetch(`${MASTRA_API_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(mastraPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mastra API error:', response.status, errorText);
      throw new Error(`Mastra API error: ${response.status}`);
    }

    // Check if the request signal is aborted
    req.signal.addEventListener('abort', () => {
      console.log('## Client aborted the request ##');
    });

    // Forward the stream directly - the AI SDK will handle the parsing
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error calling Mastra API:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Mastra API' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Pega a sessão do usuário autenticado
    const session = await auth.api.getSession({ headers: req.headers });
    const betterAuthUserId = session?.user?.id;

    // Converte Better Auth ID para UUID, ou usa 'anonymous' se não autenticado
    const userId = betterAuthUserId ? betterAuthIdToUUID(betterAuthUserId) : 'anonymous';

    const response = await fetch(
      `${MASTRA_API_URL}/agents/nutri-ia/memory?threadId=chat-${userId}&resourceId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log('## not found chats ##', response.status);
        return NextResponse.json([]);
      }
      throw new Error(`Mastra API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.messages || []);
  } catch (error) {
    console.error('Error fetching messages from Mastra API:', error);
    return NextResponse.json([]);
  }
}