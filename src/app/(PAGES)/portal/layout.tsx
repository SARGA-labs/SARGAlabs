"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "./portal.module.scss";

export default function PortalLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [userId, setUserId] = useState<string | null>(null);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
		const storedUserId = localStorage.getItem("portal_user_id");
		setUserId(storedUserId);
	}, []);

	// Provide a loading state or similar while checking auth
	// Ideally, use a more robust auth check (e.g. cookie + middleware),
	// but for this implementation we check client-side first.

	useEffect(() => {
		if (!isClient) return;

		const isLoginPage = pathname === "/auth";
		if (!userId && !isLoginPage) {
			router.push("/auth");
		}
	}, [userId, pathname, router, isClient]);

	if (!isClient) return null; // Avoid hydration mismatch

	return (
		<div className={styles.container}>
			{/* Sidebar or Header could go here */}
			<main className={styles.main}>{children}</main>
		</div>
	);
}
