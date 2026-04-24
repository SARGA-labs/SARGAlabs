import { NextResponse } from 'next/server'

/**
 * Lightweight sign-out endpoint for portal flows.
 * Server-side cannot access browser storage; client performs local cleanup.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: true,
      message: 'Sign-out acknowledged. Clear local session client-side.'
    },
    { status: 200 }
  )
}
