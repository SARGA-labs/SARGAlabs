import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


// Helper to check if user is admin (simplified for now, ideally strictly checked via auth)
// logic to protect admin routes will be needed.

export const get = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.projectId);
	},
});

export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		// Add authentication check here if needed (e.g., only allow if user is in this project)
		// For now, returning public-ish data or assume frontend handles token check
		return await ctx.db
			.query("projects")
			.filter((q) => q.eq(q.field("slug"), args.slug))
			.first();
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		clientName: v.string(),
		email: v.string(),
		price: v.string(),
		contractDetails: v.optional(v.string()),
		driveFolderId: v.string(),
		completedSteps: v.optional(v.object({
			serviceAgreement: v.boolean(),
			intake: v.boolean(),
			payment: v.boolean(),
		})),
	},
	handler: async (ctx, args) => {
		// Generate Access Code
		const uuid = crypto.randomUUID();
		const accessCode = `SAR.${args.clientName}-${uuid}`;
		const slug = args.clientName.toLowerCase().replace(/\s+/g, "-");

		const projectId = await ctx.db.insert("projects", {
			name: args.name,
			email: args.email,
			price: args.price,
			contractDetails: args.contractDetails,
			slug,
			accessCode,
			driveFolderId: args.driveFolderId,
			status: "Onboarding",
			timeline: [],
			onboardingStatus: "pending",
			completedSteps: args.completedSteps,
		});

		return { projectId, accessCode };
	},
});

export const update = mutation({
	args: {
		projectId: v.id("projects"),
		name: v.optional(v.string()),
		clientName: v.optional(v.string()), // We might want to keep slug consistent or update it. For now let's just update fields.
		email: v.optional(v.string()),
		price: v.optional(v.string()),
		status: v.optional(v.string()),
		onboardingStatus: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("paid"),
				v.literal("verified")
			)
		),
		driveFolderId: v.optional(v.string()),
		completedSteps: v.optional(v.object({
			serviceAgreement: v.boolean(),
			intake: v.boolean(),
			payment: v.boolean(),
		})),
	},
	handler: async (ctx, args) => {
		const { projectId, ...updates } = args;
		await ctx.db.patch(projectId, updates);
	},
});


export const submitVerification = mutation({
	args: {
		projectId: v.id("projects"),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.projectId, {
			onboardingStatus: "verified",
			status: "Active", // Auto-activate for now to show dashboard
		});
	},
});

export const addTimelineItem = mutation({
	args: {
		projectId: v.id("projects"),
		title: v.string(),
		date: v.string(),
		status: v.union(v.literal("upcoming"), v.literal("in-progress"), v.literal("completed")),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const project = await ctx.db.get(args.projectId);
		if (!project) throw new Error("Project not found");

		const newItem = {
			id: crypto.randomUUID(),
			title: args.title,
			date: args.date,
			status: args.status,
			description: args.description,
		};

		await ctx.db.patch(args.projectId, {
			timeline: [...(project.timeline || []), newItem],
		});

		await ctx.db.insert("activities", {
			projectId: args.projectId,
			type: "timeline_update",
			message: `New timeline item added: ${args.title}`,
			timestamp: Date.now(),
			actor: "Admin",
			metadata: { timelineItemId: newItem.id },
		});
	},
});

export const updateTimelineItem = mutation({
	args: {
		projectId: v.id("projects"),
		itemId: v.string(),
		status: v.union(v.literal("upcoming"), v.literal("in-progress"), v.literal("completed")),
	},
	handler: async (ctx, args) => {
		const project = await ctx.db.get(args.projectId);
		if (!project) throw new Error("Project not found");

		const newTimeline = (project.timeline || []).map((item: any) => {
			if (item.id === args.itemId) {
				return { ...item, status: args.status };
			}
			return item;
		});

		await ctx.db.patch(args.projectId, {
			timeline: newTimeline,
		});

		const item = project.timeline.find((i: any) => i.id === args.itemId);

		await ctx.db.insert("activities", {
			projectId: args.projectId,
			type: "timeline_update",
			message: `Timeline item updated: ${item?.title || "Unknown"} -> ${args.status}`,
			timestamp: Date.now(),
			actor: "Admin",
			metadata: { timelineItemId: args.itemId },
		});
	},
});


export const list = query({
	handler: async (ctx) => {
		return await ctx.db.query("projects").order("desc").collect();
	},
});
