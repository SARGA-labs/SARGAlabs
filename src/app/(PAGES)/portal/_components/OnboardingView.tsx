"use client";

// Import necessary UI components or icons

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import styles from "./onboarding-view.module.scss";

// Import necessary UI components or icons

export default function OnboardingView({ project }: { project: any }) {
	const submitVerification = useMutation(api.projects.submitVerification);
	// This would handle the onboarding form/process
	// For now, a simple "Mark as Complete" or "Start Onboarding" flow.
	// In a real scenario, this might modify the project object via mutation.

	return (
		<div className={styles.container}>
			<h2 className={styles.title}>Welcome to {project.name}</h2>
			<p className={styles.description}>
				Before we begin, we need to gather some details to set up your project
				workspace.
			</p>

			<div className={styles.card}>
				<div className={styles.steps}>
					{/* Define steps configuration */}
					{[
						{
							key: "serviceAgreement",
							label: "Review Service Agreement",
							content: null,
						},
						{
							key: "intake",
							label: "Fill out intake questionnaire",
							content: null,
						},
						{
							key: "payment",
							label: "Payment (50% Upfront)",
							content: (
								<>
									<p className={styles.stepTextActive}>Payment (50% Upfront)</p>
									<p className={styles.stepSubText}>
										Please transfer 50% via Bank/PayPal.
									</p>
								</>
							),
						},
						{
							key: "proofOfPayment", // This is always shown if payment is not skipped? Or maybe linked to payment?
							// User said: "Im Directly taken to upload proof of payment allow me to check or uncheck step they have already completed"
							// So if payment is checked, this should probably be hidden or marked done.
							// For now, let's assume it's a separate step that users might seek to complete.
							// But logically, if payment is done, this is done.
							label: "Upload Proof of Payment",
							content: (
								<>
									<p className={styles.stepTextInactive}>
										Upload Proof of Payment
									</p>
									<input type="file" className={styles.fileInput} />
								</>
							),
						},
					]
						.filter((step) => {
							// Filter out steps that are already completed
							if (step.key === "proofOfPayment") {
								// If payment is marked completed, hide proof of payment too
								return !project.completedSteps?.payment;
							}
							return !project.completedSteps?.[step.key];
						})
						.map((step, index) => (
							<div key={step.key} className={styles.step}>
								<div className={styles.stepNumberActive}>{index + 1}</div>
								{step.content ? (
									<div className={styles.stepContent}>{step.content}</div>
								) : (
									<p className={styles.stepTextActive}>{step.label}</p>
								)}
							</div>
						))}
				</div>

				<div className={styles.actions}>
					<button
						className={styles.button}
						type="button"
						onClick={async () => {
							try {
								await submitVerification({ projectId: project._id });
								// Optional: Refresh or show success state
								window.location.reload();
							} catch (err) {
								console.error("Failed to verify", err);
								alert("Failed to submit verification. Please try again.");
							}
						}}
					>
						Submit for Verification
					</button>
				</div>
			</div>
		</div>
	);
}
