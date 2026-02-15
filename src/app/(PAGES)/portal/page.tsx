"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "./portal.module.scss";

export default function PortalLanding() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// If logged in, we try to redirect to their project?
		// Or if they are admin, show admin dashboard.
		// For now, if they land here, and are logged in, we check localStorage.

		const slug = localStorage.getItem("portal_slug"); // We need to store this on login
		if (slug) {
		} else {
			router.push("/auth");
		}
	}, [router]);

	if (!mounted) return null;

	return (
		<div className={styles.landingContainer}>
			<div className={styles.landingContent}>
				<h1 className={styles.landingTitle}>SARGA Portal</h1>
				<p className={styles.landingText}>Redirecting...</p>
				<button
					onClick={() => router.push("/auth")}
					className={styles.landingButton}
					type="button"
				>
					Go to Login
				</button>
			</div>
		</div>
	);
}
