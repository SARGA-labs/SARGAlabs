"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Masonry from "react-masonry-css";
import { api } from "../../../convex/_generated/api";
import s from "./mainPanel.module.scss";
import { useWorkspaceModal } from "./WorkspaceModalContext";

export function MainPanel({ folderPath }: { folderPath: string }) {
	const files = useQuery(api.research.listFiles, { folder: folderPath });
	const { openModal } = useWorkspaceModal();
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const pathname = usePathname();
	const basePath = pathname.startsWith("/research") ? "/research" : "";

	if (files === undefined) {
		return (
			<div className={s.panel}>
				<div className={s.header}>Loading...</div>
			</div>
		);
	}

	const breadcrumbs = folderPath ? folderPath.split("/") : ["root"];

	return (
		<div className={s.panel}>
			<header className={s.header}>
				<div className={s.breadcrumb}>{breadcrumbs.join(" / ")}</div>
				<div className={s.controls}>
					<button
						type="button"
						className={`${s.toggle || ""} ${viewMode === "grid" ? s.active || "" : ""}`}
						onClick={() => setViewMode("grid")}
					>
						Grid
					</button>
					<button
						type="button"
						className={`${s.toggle || ""} ${viewMode === "list" ? s.active || "" : ""}`}
						onClick={() => setViewMode("list")}
					>
						List
					</button>
				</div>
			</header>

			{files.length === 0 && (
				<div style={{ opacity: 0.5, fontFamily: "monospace", padding: "20pt" }}>
					No files found in this directory.
				</div>
			)}

			{files.length > 0 && viewMode === "list" && (
				<div className={s.list}>
					<div
						className={s.file_list_item}
						style={{
							opacity: 0.5,
							borderTop: "1px solid rgba(255,255,255,0.2)",
						}}
					>
						<span>NAME</span>
						<span>TYPE</span>
						<span>DATE</span>
					</div>
					{files.map((file) => (
						<Link
							href={`${basePath}/file/${file._id}`}
							onClick={(e) => {
								e.preventDefault();
								openModal(file._id);
							}}
							key={file._id}
							className={s.file_list_item}
						>
							<span className={s.file_name}>{file.name}</span>
							<span className={s.file_meta}>{file.mime || "unknown"}</span>
							<span className={s.file_meta}>
								{new Date(file.created_at).toLocaleDateString()}
							</span>
						</Link>
					))}
				</div>
			)}

			{files.length > 0 && viewMode === "grid" && (
				<Masonry
					breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
					className={s.grid || ""}
					columnClassName={s.grid_column || ""}
				>
					{files.map((file) => (
						<Link
							href={`${basePath}/file/${file._id}`}
							onClick={(e) => {
								e.preventDefault();
								openModal(file._id);
							}}
							key={file._id}
							className={s.file_card}
						>
							<div
								style={{
									height: "120px",
									background: "rgba(255,255,255,0.02)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									marginBottom: "10px",
								}}
							>
								<span style={{ opacity: 0.2, fontFamily: "monospace" }}>
									{file.mime?.split("/")[1] || "FILE"}
								</span>
							</div>
							<div className={s.file_name}>{file.name}</div>
							<div className={s.file_meta} style={{ marginTop: "4pt" }}>
								{new Date(file.created_at).toLocaleDateString()}
							</div>
						</Link>
					))}
				</Masonry>
			)}
		</div>
	);
}
