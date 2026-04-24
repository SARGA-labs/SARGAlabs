import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const getParentFolder = (path: string): string => {
	const parts = path.split("/");
	if (parts.length <= 1) return "";
	parts.pop(); // remove file name
	return parts.join("/");
};

export const upsertFile = mutation({
	args: {
		path: v.string(),
		name: v.string(),
		mime: v.optional(v.string()),
		size: v.optional(v.number()),
		hash: v.optional(v.string()),
		storage_key: v.string(),
		modified_at: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const parent_folder = getParentFolder(args.path);

		const existing = await ctx.db
			.query("research_files")
			.withIndex("by_path", (q) => q.eq("path", args.path))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				name: args.name,
				mime: args.mime,
				size: args.size,
				hash: args.hash,
				storage_key: args.storage_key,
				modified_at: args.modified_at,
				uploaded_at: Date.now(),
				tags: args.tags !== undefined ? args.tags : existing.tags,
				description:
					args.description !== undefined
						? args.description
						: existing.description,
				parent_folder,
			});
			return existing._id;
		}

		return await ctx.db.insert("research_files", {
			...args,
			parent_folder,
			created_at: Date.now(),
			uploaded_at: Date.now(),
		});
	},
});

export const listFiles = query({
	args: {
		folder: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const targetFolder = args.folder || "";

		if (targetFolder === "") {
			// At root: files with parent_folder = "" OR undefined
			const allFiles = await ctx.db.query("research_files").collect();
			return allFiles.filter(f => !f.parent_folder || f.parent_folder === "");
		}

		return await ctx.db
			.query("research_files")
			.withIndex("by_folder", (q) => q.eq("parent_folder", targetFolder))
			.collect();
	},
});

export const getFile = query({
	args: { id: v.id("research_files") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getFileByPath = query({
	args: { path: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("research_files")
			.withIndex("by_path", (q) => q.eq("path", args.path))
			.first();
	},
});

export const deleteFile = mutation({
	args: { id: v.id("research_files") },
	handler: async (ctx, args) => {
		const existing = await ctx.db.get(args.id);
		if (existing) {
			await ctx.db.delete(existing._id);
		}
	},
});

export const deleteFileByPath = mutation({
	args: { path: v.string() },
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("research_files")
			.withIndex("by_path", (q) => q.eq("path", args.path))
			.first();

		if (existing) {
			await ctx.db.delete(existing._id);
		}
	},
});

export const searchFiles = query({
	args: {
		q: v.string(),
		tag: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		let results = [];

		if (args.q) {
			// Phase 1: simple search by name using searchIndex
			results = await ctx.db
				.query("research_files")
				.withSearchIndex("search_name", (q) => q.search("name", args.q))
				.take(100);
		} else {
			// Return recent files if no query
			results = await ctx.db.query("research_files").order("desc").take(100);
		}

		// Client/In-memory tag + additional filtering
		const tag = args.tag;
		if (tag) {
			results = results.filter((f) => f.tags?.includes(tag));
		}

		return results;
	},
});

export const getAllFolders = query({
  args: {},
  handler: async (ctx) => {
    const files = await ctx.db.query('research_files').collect()
    const folders = new Set<string>()
    for (const f of files) {
      if (f.parent_folder) {
        const parts = f.parent_folder.split('/')
        let current = ''
        for (const p of parts) {
          if (p) {
            current = current ? `${current}/${p}` : p
            folders.add(current)
          }
        }
      }
    }
    return Array.from(folders).sort()
  }
});

export const listAllFiles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('research_files').collect()
  }
});
