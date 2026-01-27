import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { secret, uri } = body;

  // Validate secret
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { message: 'Invalid secret' },
      { status: 401 }
    );
  }

  // Validate URI
  if (!uri) {
    return NextResponse.json(
      { message: 'Missing uri' },
      { status: 400 }
    );
  }

  // Revalidate the path
  // Craft uses '__home__' for homepage URI, convert to '/'
  const path = uri === '__home__' ? '/' : `/${uri}`;
  revalidatePath(path);

  return NextResponse.json({
    revalidated: true,
    path,
    timestamp: Date.now(),
  });
}
