import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const signIn = mutation({
	args: { email: v.string(), accessCode: v.string() },
	handler: async (ctx, args) => {
		// 1. Validate Access Code Format
		const codeRegex = /^SAR\.[a-zA-Z0-9]+-[a-f0-9-]+$/i;
		if (!codeRegex.test(args.accessCode)) {
			throw new Error(
				"Invalid access code format. Expected SAR.[ClientName]-[UUID]",
			);
		}

		// 2. Find Project
		const project = await ctx.db
			.query("projects")
			.withIndex("by_accessCode", (q) => q.eq("accessCode", args.accessCode))
			.first();

		if (!project) {
			throw new Error("Invalid access code. Project not found.");
		}

		// 3. Find or Create User
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.first();

		if (existingUser) {
			// If user exists but is linked to a different project, for now we deny or switch?
			// Assuming user can only be in one project for simplicity, or we check if projectId matches.
			if (existingUser.projectId !== project._id) {
				// Allow switching projects? Or throw error?
				// For now, let's update the project link to the new one (migrating user)
				// OR better: Create a new user entry if we want multi-project support in future (would need different schema).
				// Given schema has projectId on user, it's 1-to-1.
				// Let's update projectId to the new one if needed, or just return success.
				if (existingUser.projectId !== project._id) {
					await ctx.db.patch(existingUser._id, {
						projectId: project._id,
						role: "team_member",
					});
				}
				return {
					userId: existingUser._id,
					projectId: project._id,
					slug: project.slug,
				};
			}
			return {
				userId: existingUser._id,
				projectId: project._id,
				slug: project.slug,
			};
		}

		// Create new user
		const userId = await ctx.db.insert("users", {
			email: args.email,
			projectId: project._id,
			role: "team_member",
			name: args.email.split("@")[0], // Default name
		});

		return { userId, projectId: project._id, slug: project.slug };
	},
});
