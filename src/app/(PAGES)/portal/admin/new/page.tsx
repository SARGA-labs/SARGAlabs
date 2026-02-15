"use client";

import { useAction, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import styles from "../../portal.module.scss";

export default function NewClientPage() {
	const createProject = useMutation(api.projects.create);
	const sendInvite = useAction(api.actions.sendProjectInvite);

	const [formData, setFormData] = useState({
		name: "",
		clientName: "",
		email: "",
		price: "",
		contractDetails: "",
		driveFolderId: "",
		completedSteps: {
			serviceAgreement: false,
			intake: false,
			payment: false,
		},
	});

	const [status, setStatus] = useState("idle"); // idle, loading, success, error

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
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
			// 1. Create Project in Convex
			const { accessCode } = await createProject({
				name: formData.name,
				clientName: formData.clientName,
				email: formData.email,
				price: formData.price,
				contractDetails: formData.contractDetails,
				driveFolderId: formData.driveFolderId || "placeholder_folder_id",
				completedSteps: formData.completedSteps,
			});

			// 2. Send Invite Email via Resend Action
			await sendInvite({
				email: formData.email,
				projectName: formData.name,
				accessCode: accessCode,
			});

			setStatus("success");
		} catch (err) {
			console.error(err);
			setStatus("error");
		}
	};

	if (status === "success") {
		return (
			<div className={styles.container}>
				<div className={styles.landingContainer}>
					<div className={styles.landingContent}>
						<h2 className={styles.landingTitle}>Success!</h2>
						<p className={styles.landingText}>
							Client created and invite sent to {formData.email}.
						</p>
						<button
							className={styles.landingButton}
							onClick={() => {
								window.location.href = "/admin";
							}}
							type="button"
						>
							Back to Dashboard
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div
				className={styles.landingContainer}
				style={{ display: "block", padding: "var(--space)" }}
			>
				<h1 className={styles.landingTitle}>New Client</h1>

				<form
					onSubmit={handleSubmit}
					style={{
						display: "grid",
						gap: "1rem",
						maxWidth: "600px",
						margin: "0 auto",
					}}
				>
					<div>
						<label
							htmlFor="name"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#a3a3a3",
							}}
						>
							Project Name
						</label>
						<input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							style={{
								width: "100%",
								padding: "0.5rem",
								background: "#262626",
								border: "1px solid #404040",
								color: "white",
								borderRadius: "4px",
							}}
						/>
					</div>

					<div>
						<label
							htmlFor="clientName"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#a3a3a3",
							}}
						>
							Client Name (for Access Code)
						</label>
						<input
							id="clientName"
							name="clientName"
							value={formData.clientName}
							onChange={handleChange}
							required
							placeholder="e.g. Acme Corp"
							style={{
								width: "100%",
								padding: "0.5rem",
								background: "#262626",
								border: "1px solid #404040",
								color: "white",
								borderRadius: "4px",
							}}
						/>
					</div>

					<div>
						<label
							htmlFor="email"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#a3a3a3",
							}}
						>
							Email
						</label>
						<input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							required
							style={{
								width: "100%",
								padding: "0.5rem",
								background: "#262626",
								border: "1px solid #404040",
								color: "white",
								borderRadius: "4px",
							}}
						/>
					</div>

					<div>
						<label
							htmlFor="price"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#a3a3a3",
							}}
						>
							Price
						</label>
						<input
							id="price"
							name="price"
							value={formData.price}
							onChange={handleChange}
							required
							style={{
								width: "100%",
								padding: "0.5rem",
								background: "#262626",
								border: "1px solid #404040",
								color: "white",
								borderRadius: "4px",
							}}
						/>
					</div>

					<div>
						<label
							htmlFor="contractDetails"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#a3a3a3",
							}}
						>
							Contract Details
						</label>
						<textarea
							id="contractDetails"
							name="contractDetails"
							value={formData.contractDetails}
							onChange={handleChange}
							rows={5}
							placeholder="Paste contract text or HTML here..."
							style={{
								width: "100%",
								padding: "0.5rem",
								background: "#262626",
								border: "1px solid #404040",
								color: "white",
								borderRadius: "4px",
							}}
						/>
					</div>

					<div>
						<label
							htmlFor="driveFolderId"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#a3a3a3",
							}}
						>
							Drive Folder ID (Optional)
						</label>
						<input
							id="driveFolderId"
							name="driveFolderId"
							value={formData.driveFolderId}
							onChange={handleChange}
							style={{
								width: "100%",
								padding: "0.5rem",
								background: "#262626",
								border: "1px solid #404040",
								color: "white",
								borderRadius: "4px",
							}}
						/>
					</div>

					<div style={{ marginTop: "1rem" }}>
						<p style={{ marginBottom: "0.5rem", color: "#a3a3a3" }}>
							Already Completed Steps:
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
								Payment (50%)
							</label>
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
							opacity: status === "loading" ? 0.7 : 1,
						}}
					>
						{status === "loading"
							? "Creating & Sending Invite..."
							: "Create Client"}
					</button>

					{status === "error" && (
						<p style={{ color: "red", marginTop: "1rem" }}>
							Error creating client. Check console.
						</p>
					)}
				</form>
			</div>
		</div>
	);
}
