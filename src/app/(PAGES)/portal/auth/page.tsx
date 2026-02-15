"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import styles from "./auth.module.scss";

export default function PortalLogin() {
	const [email, setEmail] = useState("");
	const [accessCode, setAccessCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const signIn = useMutation(api.auth.signIn);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = await signIn({ email, accessCode });

			// Store session data (simplistic approach for now)
			localStorage.setItem("portal_user_id", result.userId);
			localStorage.setItem("portal_project_id", result.projectId);
			localStorage.setItem("portal_slug", result.slug || "");

			// Redirect to client dashboard
			router.push(`/${result.slug}`);
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Failed to sign in");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<div className={styles.header}>
					{/* Replace with your actual logo component or image */}
					<h2 className={styles.title}>Client Portal</h2>
					<p className={styles.subtitle}>
						Enter your access code to view your project
					</p>
				</div>

				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.inputGroup}>
						<div>
							<label htmlFor="email-address" className={styles.label}>
								Email address
							</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className={styles.inputTop}
								placeholder="Email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<label htmlFor="access-code" className={styles.label}>
								Access Code
							</label>
							<input
								id="access-code"
								name="accessCode"
								type="text"
								required
								className={styles.inputBottom}
								placeholder="SAR.Client-UUID"
								value={accessCode}
								onChange={(e) => setAccessCode(e.target.value)}
							/>
						</div>
					</div>

					{error && <div className={styles.error}>{error}</div>}

					<div>
						<button
							type="submit"
							disabled={loading}
							className={styles.submitButton}
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
