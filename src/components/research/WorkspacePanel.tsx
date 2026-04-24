"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { FilePreview } from "./FilePreview";
import s from "./workspace.module.scss";

export function WorkspacePanel({
	fileId,
	isModal,
	onCloseModal,
}: {
	fileId: Id<"research_files">;
	isModal?: boolean;
	onCloseModal?: () => void;
}) {
	const file = useQuery(api.research.getFile, { id: fileId });
	const pathname = usePathname();
	const basePath = pathname.startsWith("/research") ? "/research" : "";

	if (file === undefined) {
		return <div style={{ padding: "20pt" }}>Loading workspace...</div>;
	}

	if (file === null) {
		return <div style={{ padding: "20pt" }}>File not found</div>;
	}

	const r2Base = (
		process.env.NEXT_PUBLIC_R2_URL || "https://pub-your-r2-url.r2.dev"
	).replace(/\/$/, "");
	const fileUrl = file.storage_key ? `${r2Base}/${file.storage_key}` : "";

	return (
		<div className={s.workspace}>
			<div className={s.preview_area}>
				<FilePreview
					mime={file.mime || "application/octet-stream"}
					url={fileUrl}
					name={file.name}
				/>
			</div>

			<aside className={s.inspector}>
				<div className={s.inspector_header}>
					<div style={{ fontWeight: "bold" }}>INSPECTOR</div>
					{isModal ? (
						<button
							type="button"
							onClick={() => {
								if (onCloseModal) onCloseModal();
								else window.history.back();
							}}
							style={{
								background: "none",
								border: "none",
								color: "inherit",
								cursor: "pointer",
								fontFamily: "inherit",
							}}
						>
							✕ CLOSE
						</button>
					) : (
						<Link href={`${basePath}/${file.parent_folder || ""}`}>
							✕ CLOSE
						</Link>
					)}
				</div>

				<div className={s.inspector_body}>
					<div className={s.field}>
						<span className={s.label}>Name</span>
						<span className={s.value} style={{ fontWeight: "bold" }}>
							{file.name}
						</span>
					</div>

					<div className={s.field}>
						<span className={s.label}>Type</span>
						<span className={s.value}>{file.mime || "Unknown"}</span>
					</div>

					<div className={s.field}>
						<span className={s.label}>Size</span>
						<span className={s.value}>
							{file.size
								? `${(file.size / 1024 / 1024).toFixed(2)} MB`
								: "Unknown"}
						</span>
					</div>

					<div className={s.field}>
						<span className={s.label}>Added</span>
						<span className={s.value}>
							{new Date(file.created_at).toLocaleString()}
						</span>
					</div>

					{file.description && (
						<div className={s.field}>
							<span className={s.label}>Description</span>
							<span className={s.value}>{file.description}</span>
						</div>
					)}

					{file.tags && file.tags.length > 0 && (
						<div className={s.field}>
							<span className={s.label}>Tags</span>
							<div className={s.tags}>
								{file.tags.map((tag) => (
									<span key={tag} className={s.tag}>
										{tag}
									</span>
								))}
							</div>
						</div>
					)}

					<div className={s.field} style={{ marginTop: "20pt" }}>
						<span className={s.label}>Hash (MD5/SHA)</span>
						<span className={s.value} style={{ opacity: 0.5 }}>
							{file.hash || "N/A"}
						</span>
					</div>
				</div>
			</aside>
		</div>
	);
}
