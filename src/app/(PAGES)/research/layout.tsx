import type React from "react";
import { Sidebar } from "~/components/research/Sidebar";
import { WorkspaceModalProvider } from "~/components/research/WorkspaceModalContext";
import s from "./layout.module.scss";

export default function ResearchLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<WorkspaceModalProvider>
			<div className={s.container}>
				<aside className={s.sidebar}>
					<Sidebar />
				</aside>
				<main className={s.main}>{children}</main>
			</div>
		</WorkspaceModalProvider>
	);
}
