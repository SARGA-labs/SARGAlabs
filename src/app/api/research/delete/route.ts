import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { client } from "../upload-url/route";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
	const { path } = await req.json();

	if (!path) {
		return Response.json(
			{ success: false, error: "Missing path parameter" },
			{ status: 400 },
		);
	}

	try {
		await client.send(
			new DeleteObjectCommand({
				Bucket: process.env.R2_BUCKET_NAME || "research",
				Key: path,
			}),
		);

		await convex.mutation(api.research.deleteFileByPath, { path });

		return Response.json({ success: true });
	} catch (error: any) {
		return Response.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}
