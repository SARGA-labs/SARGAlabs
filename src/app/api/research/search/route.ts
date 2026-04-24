import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || ''
const convex = new ConvexHttpClient(convexUrl)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const tag = searchParams.get('tag') || undefined

  try {
    const files = await convex.query(api.research.searchFiles, { q, tag })
    return Response.json({ success: true, data: files })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ success: false, error: msg }, { status: 500 })
  }
}
