import { NextResponse } from 'next/server';
import { errorJson, getEasterEggMessage } from '../_shared';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const message = await getEasterEggMessage();
    return NextResponse.json(
      { message },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error) {
    return errorJson(error);
  }
}
