import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

const CATALOG_API_URL = process.env.CATALOG_API_URL || 'http://localhost:8000';

function betterAuthIdToUUID(betterAuthId: string): string {
  const hash = createHash('md5').update(betterAuthId).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('X-User-Id');
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('page_size') || '10';

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userUUID = betterAuthIdToUUID(userId);

  try {
    const response = await fetch(
      `${CATALOG_API_URL}/api/v1/meal-plans?user_id=${userUUID}&page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('X-User-Id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userUUID = betterAuthIdToUUID(userId);

  try {
    const body = await request.json();

    const response = await fetch(
      `${CATALOG_API_URL}/api/v1/meal-plans?user_id=${userUUID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to create meal plan' },
      { status: 500 }
    );
  }
}
