"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import styles from "../../../portal.module.scss";

export default function EditProjectPage() {
	const params = useParams();
	const router = useRouter();
	const projectId = params?.projectId as Id<"projects">;

	const project = useQuery(api.projects.get, { projectId });
	const updateProject = useMutation(api.projects.update);
	const addTimelineItem = useMutation(api.projects.addTimelineItem);

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		price: "",
		status: "",
		completedSteps: {
			serviceAgreement: false,
			intake: false,
			payment: false,
		},
	});

	const [status, setStatus] = useState("idle");

	useEffect(() => {
		if (project) {
			setFormData({
				name: project.name,
				email: project.email,
				price: project.price,
				status: project.status,
				completedSteps: project.completedSteps || {
					serviceAgreement: false,
					intake: false,
					payment: false,
				},
			});
		}
	}, [project]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			completedSteps: {
				...formData.completedSteps,
				[e.target.name]: e.target.checked,
			},
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus("loading");
		try {
			await updateProject({
				projectId,
				name: formData.name,
				email: formData.email,
				price: formData.price,
				status: formData.status,
				completedSteps: formData.completedSteps,
			});
			setStatus("success");
			setTimeout(() => {
				router.push("/admin");
			}, 1000);
		} catch (err) {
			console.error(err);
			setStatus("error");
		}
	};

	if (!project) return <div className={styles.container}>Loading...</div>;

	return (
		<div className={styles.container}>
			<div
				className={styles.landingContainer}
				style={{ display: "block", padding: "var(--space)" }}
			>
				<h1 className={styles.landingTitle}>Edit Project: {project.name}</h1>

				<form
					onSubmit={handleSubmit}
					style={{
						display: "grid",
						gap: "1rem",
						maxWidth: "600px",
						margin: "2rem auto",
					}}
				>
					{/* Name */}
					<div>
						<label
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#a3a3a3",
							}}
						>
							Project Name
							<input
								name="name"
								value={formData.name}
								onChange={handleChange}
								style={{
									display: "block",
									width: "100%",
									marginTop: "0.25rem",
									padding: "0.5rem",
									background: "#262626",
									border: "1px solid #404040",
									color: "white",
									borderRadius: "4px",
								}}
							/>
						</label>
					</div>

					{/* Email */}
					<div>
						<label
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#a3a3a3",
							}}
						>
							Email
							<input
								name="email"
								value={formData.email}
								onChange={handleChange}
								style={{
									display: "block",
									width: "100%",
									marginTop: "0.25rem",
									padding: "0.5rem",
									background: "#262626",
									border: "1px solid #404040",
									color: "white",
									borderRadius: "4px",
								}}
							/>
						</label>
					</div>

					{/* Status */}
					<div>
						<label
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#a3a3a3",
							}}
						>
							Status
							<select
								name="status"
								value={formData.status}
								onChange={(e) =>
									setFormData({ ...formData, status: e.target.value })
								}
								style={{
									display: "block",
									width: "100%",
									marginTop: "0.25rem",
									padding: "0.5rem",
									background: "#262626",
									border: "1px solid #404040",
									color: "white",
									borderRadius: "4px",
								}}
							>
								<option value="Onboarding">Onboarding</option>
								<option value="Active">Active</option>
								<option value="Completed">Completed</option>
								<option value="Archived">Archived</option>
							</select>
						</label>
					</div>

					{/* Completed Steps */}
					<div style={{ marginTop: "1rem" }}>
						<p style={{ marginBottom: "0.5rem", color: "#a3a3a3" }}>
							Completed Steps:
						</p>
						<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									color: "white",
								}}
							>
								<input
									type="checkbox"
									name="serviceAgreement"
									checked={formData.completedSteps.serviceAgreement}
									onChange={handleCheckboxChange}
								/>
								Service Agreement
							</label>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									color: "white",
								}}
							>
								<input
									type="checkbox"
									name="intake"
									checked={formData.completedSteps.intake}
									onChange={handleCheckboxChange}
								/>
								Intake
							</label>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									color: "white",
								}}
							>
								<input
									type="checkbox"
									name="payment"
									checked={formData.completedSteps.payment}
									onChange={handleCheckboxChange}
								/>
								Payment
							</label>
						</div>
					</div>

					<div
						style={{
							marginTop: "2rem",
							borderTop: "1px solid #404040",
							paddingTop: "1rem",
						}}
					>
						<h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
							Timeline Management
						</h2>

						{/* Add New Item */}
						<div
							style={{
								background: "#1a1a1a",
								padding: "1rem",
								borderRadius: "8px",
								marginBottom: "1rem",
							}}
						>
							<h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
								Add Milestone
							</h3>
							<div style={{ display: "grid", gap: "0.5rem" }}>
								<input
									placeholder="Title (e.g. Design Phase)"
									id="timelineTitle"
									style={{
										padding: "0.5rem",
										background: "#262626",
										border: "1px solid #404040",
										color: "white",
										borderRadius: "4px",
									}}
								/>
								<input
									type="date"
									id="timelineDate"
									style={{
										padding: "0.5rem",
										background: "#262626",
										border: "1px solid #404040",
										color: "white",
										borderRadius: "4px",
									}}
								/>
								<textarea
									placeholder="Description (Optional)"
									id="timelineDesc"
									style={{
										padding: "0.5rem",
										background: "#262626",
										border: "1px solid #404040",
										color: "white",
										borderRadius: "4px",
									}}
								/>
								<button
									type="button"
									onClick={async () => {
										const titleInput = document.getElementById(
											"timelineTitle",
										) as HTMLInputElement;
										const dateInput = document.getElementById(
											"timelineDate",
										) as HTMLInputElement;
										const descInput = document.getElementById(
											"timelineDesc",
										) as HTMLTextAreaElement;

										if (titleInput.value && dateInput.value) {
											await addTimelineItem({
												projectId,
												title: titleInput.value,
												date: dateInput.value,
												status: "upcoming",
												description: descInput.value,
											});
											titleInput.value = "";
											dateInput.value = "";
											descInput.value = "";
											alert("Milestone added!");
										} else {
											alert("Please fill title and date");
										}
									}}
									style={{
										padding: "0.5rem",
										background: "#333",
										color: "white",
										border: "none",
										borderRadius: "4px",
										cursor: "pointer",
									}}
								>
									Add Milestone
								</button>
							</div>
						</div>

						{/* List Items */}
						<div style={{ display: "grid", gap: "0.5rem" }}>
							{project.timeline?.map((item: any) => (
								<div
									key={item.id}
									style={{
										background: "#1a1a1a",
										padding: "0.5rem",
										borderRadius: "4px",
										display: "flex",
										justifyContent: "space-between",
									}}
								>
									<div>
										<p style={{ fontWeight: "bold" }}>{item.title}</p>
										<p style={{ fontSize: "0.8rem", color: "#888" }}>
											{item.date} • {item.status}
										</p>
									</div>
									{/* Could add edit/delete here later */}
								</div>
							))}
						</div>
					</div>

					<button
						type="submit"
						disabled={status === "loading"}
						style={{
							marginTop: "1rem",
							padding: "0.75rem",
							background: "white",
							color: "black",
							fontWeight: "bold",
							border: "none",
							borderRadius: "4px",
							cursor: status === "loading" ? "not-allowed" : "pointer",
						}}
					>
						{status === "loading" ? "Saving..." : "Save Changes"}
					</button>

					{status === "success" && (
						<p style={{ color: "green", marginTop: "0.5rem" }}>
							Saved successfully!
						</p>
					)}
					{status === "error" && (
						<p style={{ color: "red", marginTop: "0.5rem" }}>
							Error saving changes.
						</p>
					)}
				</form>
			</div>
		</div>
	);
}
