import type { Metadata } from "next";
import WriteComponent from "~/components/layout/write";
import { getAllMdxContent } from "~/lib/utils/mdx";

export const metadata: Metadata = {
	title: "WRITE",
};

const WRITEPAGE = async () => {
	const initialItems = await getAllMdxContent();
	return <WriteComponent initialItems={initialItems} />;
};

export default WRITEPAGE;
