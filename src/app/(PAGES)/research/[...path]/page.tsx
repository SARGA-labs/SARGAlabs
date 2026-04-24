import { MainPanel } from "~/components/research/MainPanel";

export default async function ResearchFolderPage(props: {
	params: Promise<{ path: string[] }>;
}) {
	const params = await props.params;
	const folderPath = params.path.join("/");
	return <MainPanel folderPath={folderPath} />;
}
