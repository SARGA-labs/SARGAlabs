import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || ''
const convex = new ConvexHttpClient(convexUrl)

export async function POST(req: Request) {
  const data = await req.json()

  try {
    const result = await convex.mutation(api.research.upsertFile, {
      path: data.path,
      name: data.name,
      mime: data.mime,
      size: data.size,
      hash: data.hash,
      storage_key: data.storage_key,
      modified_at: data.modified_at,
      tags: data.tags,
      description: data.description
    })

    return Response.json({ success: true, id: result })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ success: false, error: msg }, { status: 500 })
  }
}
