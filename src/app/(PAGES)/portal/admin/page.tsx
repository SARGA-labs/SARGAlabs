"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import styles from "../portal.module.scss"; // Reusing portal styles for consistency

export default function AdminDashboard() {
	// We need a query to list all projects.
	// currently we only have 'get' (single) and 'getBySlug'.
	// I need to add a 'list' query to projects.ts first. AAAAA
	// Wait, I'll add the list query in the next step.
	// For now I'll scaffold the UI.

	const projects = useQuery(api.projects.list) || [];

	return (
		<div className={styles.container}>
			<div
				className={styles.landingContainer}
				style={{ display: "block", padding: "var(--space)" }}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "var(--space)",
					}}
				>
					<h1 className={styles.landingTitle}>Admin Dashboard</h1>
					<Link
						href="/admin/new"
						className={styles.landingButton}
						style={{
							textDecoration: "none",
							border: "1px solid currentColor",
							padding: "0.5rem 1rem",
							borderRadius: "4px",
						}}
					>
						+ New Client
					</Link>
				</div>

				<div style={{ display: "grid", gap: "1rem" }}>
					{projects.length === 0 ? (
						<p className={styles.landingText}>No projects found.</p>
					) : (
						projects.map((project: any) => (
							<div
								key={project._id}
								style={{
									border: "1px solid #262626",
									padding: "1rem",
									borderRadius: "8px",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div>
									<h3 style={{ fontWeight: "bold" }}>{project.name}</h3>
									<p style={{ fontSize: "0.875rem", color: "#737373" }}>
										{project.email}
									</p>
								</div>
								<div style={{ textAlign: "right" }}>
									<p style={{ fontSize: "0.875rem" }}>
										Status: {project.status}
									</p>
									<Link
										href={`/admin/edit/${project._id}`}
										style={{
											fontSize: "0.875rem",
											color: "#a3a3a3",
											marginRight: "1rem",
										}}
									>
										Edit
									</Link>
									<Link
										href={`/${project.slug}`}
										style={{
											fontSize: "0.875rem",
											color: "var(--color-primary)",
										}}
									>
										View Dashboard
									</Link>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
