import { type NextRequest, NextResponse } from "next/server";
import { getDriveFiles } from "~/lib/drive";

// This API route acts as a secure proxy to fetch files from Google Drive
// without exposing the Service Account credentials to the client.

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const folderId = searchParams.get("folderId");

	if (!folderId) {
		return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
	}

	// Optional: Add auth check here to ensure the user has access to this folderId
	// For now, we rely on the fact that only authenticated users get the folderId from Convex
	// and successful access code verification.

	// Check for placeholder folder ID
	if (folderId === "placeholder_folder_id") {
		return NextResponse.json({ files: [] });
	}

	try {
		const files = await getDriveFiles(folderId);
		return NextResponse.json({ files });
	} catch (error) {
		console.error("Drive API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch files" },
			{ status: 500 },
		);
	}
}
