/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <> */
"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { WorkspacePanel } from "./WorkspacePanel";

const WorkspaceModalContext = createContext<{
	openModal: (fileId: string) => void;
	closeModal: () => void;
}>({
	openModal: () => {},
	closeModal: () => {},
});

export function WorkspaceModalProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [activeFileId, setActiveFileId] = useState<string | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		const handlePopState = () => {
			if (
				window.location.pathname === "/" ||
				window.location.pathname === "/research" ||
				window.location.pathname === "/search" ||
				window.location.pathname === "/research/search"
			) {
				setActiveFileId(null);
			} else if (window.location.pathname.includes("/file/")) {
				const id = window.location.pathname.split("/").pop();
				if (id) setActiveFileId(id);
			}
		};
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);

	const openModal = (fileId: string) => {
		setActiveFileId(fileId);
		const basePath = pathname.startsWith("/research") ? "/research" : "";
		window.history.pushState(null, "", `${basePath}/file/${fileId}`);
	};

	const closeModal = () => {
		setActiveFileId(null);
		const basePath = pathname.startsWith("/research") ? "/research" : "";
		window.history.pushState(null, "", basePath || "/");
	};

	return (
		<WorkspaceModalContext.Provider value={{ openModal, closeModal }}>
			{children}
			{activeFileId && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						background: "rgba(0, 0, 0, 0.85)",
						backdropFilter: "blur(10px)",
						zIndex: 9999,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "20pt",
					}}
					onClick={closeModal}
					role="presentation"
				>
					<div
						style={{
							width: "100%",
							maxWidth: "1200px",
							height: "90vh",
							background: "var(--color-base)",
							border: "1px solid rgba(255, 255, 255, 0.15)",
							borderRadius: "8pt",
							overflow: "hidden",
							position: "relative",
							boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
							display: "flex",
							flexDirection: "column",
						}}
						onClick={(e) => e.stopPropagation()}
						role="presentation"
					>
						<WorkspacePanel
							fileId={activeFileId as Id<"research_files">}
							isModal={true}
							onCloseModal={closeModal}
						/>
					</div>
				</div>
			)}
		</WorkspaceModalContext.Provider>
	);
}

export const useWorkspaceModal = () => useContext(WorkspaceModalContext);
