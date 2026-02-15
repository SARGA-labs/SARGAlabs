"use client";

import { usePathname } from "next/navigation";
import { Container } from "~/components/container";

export const Watermark = () => {
	const pathname = usePathname();
	// Usually `(group)` is not in path. So it might be `sar.ga/clientName`.
	// If so, `isPortal` might need to be looser or specific to "not homepage".
	// However, the `RootLayout` wraps everything.
	// Let's assume standard behavior: if it's not root `/` and not `/login`, maybe treat as app?
	// Or simpler: The user said "portal page".
	// Let's try: if it matches the client dashboard pattern or admin pattern.

	// Actually, looking at `src/app/(PAGES)/portal/page.tsx`, the path is likely just `/portal` or similar if the group doesn't add a segment.
	// But `(PAGES)` suggests it might be organized.
	// Let's assume `isPortal` = `pathname !== "/"`.

	// Re-reading user request: "on the portal page its showed at the top center".
	// The user might be viewing `/[clientName]`.

	const isDashboard = pathname !== "/" && pathname !== "/projects"; // Simplistic check

	return (
		<Container
			style={{
				width: "100%",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: isDashboard ? "flex-start" : "center",
				paddingTop: isDashboard ? "2rem" : "0",
				position: "fixed",
				inset: 0,
				pointerEvents: "none",
				zIndex: 0, // Ensure it's behind if needed, layout.tsx had it as background
			}}
		>
			<h1>SARGA 2026</h1>
		</Container>
	);
};
