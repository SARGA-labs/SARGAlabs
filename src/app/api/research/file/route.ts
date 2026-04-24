import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || ''
const convex = new ConvexHttpClient(convexUrl);

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const idStr = searchParams.get("id");

	if (!idStr) {
		return Response.json(
			{ success: false, error: "Missing id parameter" },
			{ status: 400 },
		);
	}

	try {
		const file = await convex.query(api.research.getFile, {
			id: idStr as Id<"research_files">,
		});
		return Response.json({ success: true, data: file });
	  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ success: false, error: msg }, { status: 500 })
  }
}
