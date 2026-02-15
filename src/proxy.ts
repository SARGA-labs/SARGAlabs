import { type NextRequest, NextResponse } from "next/server";

export const config = {
	matcher: ["/((?!api|_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};

const ALLOWED = new Set([
	"studio",
	"support",
	"write",
	"research",
	"club",
	"portal",
]);

function getSubdomain(host: string) {
	const hostname = host.split(":")[0];

	// dev: studio.sar.local
	if (hostname!.endsWith(".sar.local")) {
		return hostname!.replace(".sar.local", "");
	}

	// dev: studio.localhost
	if (hostname!.endsWith(".localhost")) {
		return hostname!.replace(".localhost", "");
	}

	// prod: studio.sar.ga
	const parts = hostname!.split(".");
	if (parts.length >= 3) return parts[0];
	return "";
}

export default function proxy(req: NextRequest) {
	const host = req.headers.get("host") || "";
	const url = req.nextUrl.clone();

	const subdomain = getSubdomain(host);

	// A) Subdomain -> rewrite to /studio, /support, /journal
	if (subdomain && subdomain !== "www") {
		if (!ALLOWED.has(subdomain)) {
			// Unknown subdomain -> show your custom NotFound UI
			url.pathname = "/404";
			return NextResponse.rewrite(url);
		}

		url.pathname = `/${subdomain}${url.pathname}`;
		return NextResponse.rewrite(url);
	}

	// B) Apex -> redirect /studio/* -> https://studio.<apex>/*
	const seg = req.nextUrl.pathname.split("/")[1];
	if (seg && ALLOWED.has(seg)) {
		const redirectTo = req.nextUrl.clone();

		// Build: seg.<current-hostname>
		const hostname = host.split(":")[0];
		redirectTo.host = `${seg}.${hostname}`;

		// Drop the first segment
		redirectTo.pathname = req.nextUrl.pathname.replace(`/${seg}`, "") || "/";

		return NextResponse.redirect(redirectTo, 308);
	}

	return NextResponse.next();
}
