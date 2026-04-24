"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ConvexClientProvider from "./ConvexClientProvider";

const queryClient = new QueryClient();

export const Providers = ({ children }: { children?: React.ReactNode }) => {
	return (
		<ConvexClientProvider>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ConvexClientProvider>
	);
};
