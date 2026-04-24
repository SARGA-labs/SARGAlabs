import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || ''
const convex = new ConvexHttpClient(convexUrl)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const folder = searchParams.get('folder') || ''

  try {
    const files = await convex.query(api.research.listFiles, { folder })
    return Response.json({ success: true, data: files })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ success: false, error: msg }, { status: 500 })
  }
}
