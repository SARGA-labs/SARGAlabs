"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../../../convex/_generated/api";

import OnboardingView from "../_components/OnboardingView";

import styles from "./dashboard.module.scss";

interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	webViewLink: string;
	iconLink: string;
	thumbnailLink: string;
}

export default function ClientDashboard() {
	const params = useParams();
	const slug = params?.clientName as string;

	// In a real app, we'd fetch project by slug securely.
	// For now, we can use the slug to find the project or rely on localStorage context if we want to be strict.
	// Let's assume the slug is the unique identifier for the route.

	const project = useQuery(api.projects.getBySlug, { slug: slug || "" });

	// Fetch activities (we need to import the query first)
	// Since we didn't export it in api yet, let's assume we need to import it.
	// Actually, let's check if we exported it in api/activities.js or similar?
	// We created convex/activities.ts, so api.activities.get should be available after codegen.
	const activities = useQuery(
		api.activities.get,
		project ? { projectId: project._id } : "skip",
	);

	const [files, setFiles] = useState<DriveFile[]>([]);
	const [loadingFiles, setLoadingFiles] = useState(false);

	useEffect(() => {
		if (project?.driveFolderId) {
			setLoadingFiles(true);
			fetch(`/api/drive?folderId=${project.driveFolderId}`)
				.then((res) => res.json())
				.then((data) => {
					if (data.files) setFiles(data.files);
				})
				.catch((err) => console.error("Failed to load drive files", err))
				.finally(() => setLoadingFiles(false));
		}
	}, [project]);

	if (!project)
		return <div className="p-10 text-center">Loading Project...</div>;

	if (project.status === "Onboarding") {
		return <OnboardingView project={project} />;
	}

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div>
					<h1 className={styles.projectName}>{project.name}</h1>
					<p className={styles.projectMeta}>Client Portal • {project.status}</p>
				</div>
				<div className="text-right">
					{/* Add logout or user profile here */}
				</div>
			</header>

			<div className={styles.grid}>
				{/* Main Content Area */}
				<div className={styles.mainContent}>
					{/* Timeline Section */}
					<section>
						<h2 className={styles.sectionTitle}>Timeline</h2>
						<div className={styles.card}>
							{!project.timeline || project.timeline.length === 0 ? (
								<p className="text-center text-neutral-500 py-8">
									No timeline milestones yet.
								</p>
							) : (
								<div className={styles.timelineContainer}>
									<div className={styles.timelineLine}></div>
									{project.timeline.map((item: any) => (
										<div key={item.id} className={styles.timelineItem}>
											<div className={styles.timelineIconWrapper}>
												<div
													className={`${styles.timelineIcon} ${item.status === "completed" ? styles.iconCompleted : ""}`}
												>
													{item.status === "completed" ? "✓" : "•"}
												</div>
											</div>
											<div className={styles.timelineContent}>
												<h3 className={styles.timelineTitle}>{item.title}</h3>
												<p className={styles.timelineDate}>
													{item.date} •{" "}
													<span style={{ textTransform: "capitalize" }}>
														{item.status}
													</span>
												</p>
												{item.description && (
													<p
														className={styles.timelineDesc}
														style={{
															marginTop: "0.5rem",
															color: "#a3a3a3",
															fontSize: "0.9rem",
														}}
													>
														{item.description}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</section>

					{/* Deliverables Section */}
					<section>
						<h2 className={styles.sectionTitle}>Deliverables</h2>
						<div className={styles.cardNoPadding}>
							{loadingFiles ? (
								<div className={styles.emptyState}>
									Loading files from Drive...
								</div>
							) : files.length === 0 ? (
								<div className={styles.emptyState}>
									No deliverables uploaded yet.
								</div>
							) : (
								<ul className={styles.fileList}>
									{files.map((file) => (
										<li key={file.id} className={styles.fileItem}>
											<a
												href={file.webViewLink}
												target="_blank"
												rel="noopener noreferrer"
												className={styles.fileLink}
											>
												<div className={styles.fileIconWrapper}>
													{/* File Icon placeholder */}
													<div className={styles.fileIcon}>FILE</div>
												</div>
												<div className={styles.fileInfo}>
													<p className={styles.fileName}>{file.name}</p>
													<p className={styles.fileMeta}>Google Drive Linked</p>
												</div>
												<div className={styles.arrowIcon}>→</div>
											</a>
										</li>
									))}
								</ul>
							)}
						</div>
					</section>
				</div>

				{/* Sidebar / Info */}
				<div className={styles.sidebar}>
					<section className={styles.sidebarWrapper}>
						<h3 className={styles.sidebarTitle}>Project Details</h3>
						<dl className={styles.sidebarList}>
							<div>
								<dt className={styles.dt}>Status</dt>
								<dd className={styles.dd}>
									<span className={styles.statusBadge}>{project.status}</span>
								</dd>
							</div>
							<div>
								<dt className={styles.dt}>Access Type</dt>
								<dd className={styles.dd}>Portal Access</dd>
							</div>
						</dl>
					</section>

					<section className={styles.sidebarWrapper}>
						<h3 className={styles.sidebarTitle}>Activity Feed</h3>
						{activities ? (
							<ul
								className={styles.activityList}
								style={{ display: "grid", gap: "1rem" }}
							>
								{activities.length === 0 && (
									<p className={styles.dt}>No recent activity.</p>
								)}
								{activities.map((activity: any) => (
									<li
										key={activity._id}
										style={{
											fontSize: "0.875rem",
											borderBottom: "1px solid #333",
											paddingBottom: "0.5rem",
										}}
									>
										<p style={{ color: "white", marginBottom: "0.25rem" }}>
											{activity.message}
										</p>
										<p style={{ color: "#737373", fontSize: "0.75rem" }}>
											{new Date(activity.timestamp).toLocaleDateString()}{" "}
											{new Date(activity.timestamp).toLocaleTimeString()}
										</p>
									</li>
								))}
							</ul>
						) : (
							<p className={styles.dt}>Loading activity...</p>
						)}
					</section>
				</div>
			</div>
		</div>
	);
}
