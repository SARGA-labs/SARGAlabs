import { WorkspacePanel } from "~/components/research/WorkspacePanel";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default async function ResearchFilePage(props: {
	params: Promise<{ id: string }>;
}) {
	const params = await props.params;
	return <WorkspacePanel fileId={params.id as Id<"research_files">} />;
}
