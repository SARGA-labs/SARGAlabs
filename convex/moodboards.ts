import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireAdmin } from './lib/auth'

export const create = mutation({
  args: {
    userId: v.id('users'),
    projectId: v.id('projects'),
    name: v.string()
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId)

    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const moodboardId = await ctx.db.insert('moodboards', {
      projectId: args.projectId,
      name: args.name,
      slug,
      sections: [],
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    return moodboardId
  }
})

export const update = mutation({
  args: {
    userId: v.id('users'),
    moodboardId: v.id('moodboards'),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    sections: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          items: v.array(
            v.object({
              id: v.string(),
              type: v.union(
                v.literal('image'),
                v.literal('video'),
                v.literal('audio'),
                v.literal('link'),
                v.literal('text'),
                v.literal('divider')
              ),
              content: v.string(),
              caption: v.optional(v.string()),
              order: v.number(),
              linkPreview: v.optional(
                v.object({
                  title: v.optional(v.string()),
                  description: v.optional(v.string()),
                  image: v.optional(v.string())
                })
              )
            })
          )
        })
      )
    ),
    isPublic: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId)

    const { userId, moodboardId, ...updates } = args

    await ctx.db.patch(moodboardId, {
      ...updates,
      updatedAt: Date.now()
    })
  }
})

export const remove = mutation({
  args: {
    userId: v.id('users'),
    moodboardId: v.id('moodboards')
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId)
    await ctx.db.delete(args.moodboardId)
  }
})

export const get = query({
  args: {
    userId: v.id('users'),
    moodboardId: v.id('moodboards')
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId)
    return await ctx.db.get(args.moodboardId)
  }
})

export const listByProject = query({
  args: {
    userId: v.id('users'),
    projectId: v.id('projects')
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId)
    return await ctx.db
      .query('moodboards')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .order('desc')
      .collect()
  }
})

export const clientListByProject = query({
  args: {
    projectId: v.id('projects')
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('moodboards')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .filter((q) => q.eq(q.field('isPublic'), true))
      .order('desc')
      .collect()
  }
})

export const getPublic = query({
  args: {
    projectSlug: v.string(),
    moodboardSlug: v.string(),
    accessCode: v.string()
  },
  handler: async (ctx, args) => {
    // 1. Verify Project Access Code
    const project = await ctx.db
      .query('projects')
      .withIndex('by_slug', (q) => q.eq('slug', args.projectSlug))
      .first()

    if (!project) {
      return { success: false as const, error: 'Project not found' }
    }

    if (project.accessCode !== args.accessCode) {
      return { success: false as const, error: 'Invalid access code' }
    }

    // 2. Fetch Moodboard
    const moodboard = await ctx.db
      .query('moodboards')
      .withIndex('by_slug', (q) =>
        q.eq('projectId', project._id).eq('slug', args.moodboardSlug)
      )
      .first()

    if (!moodboard || !moodboard.isPublic) {
      return { success: false as const, error: 'Moodboard not found or not public' }
    }

    return { success: true as const, moodboard }
  }
})
