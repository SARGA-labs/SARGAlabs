import { v } from 'convex/values'
import { query } from './_generated/server'
import { requireProjectAccess } from './lib/auth'

export const get = query({
  args: { projectId: v.id('projects'), userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.userId, args.projectId)

    return await ctx.db
      .query('activities')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.projectId))
      .order('desc')
      .take(20)
  }
})
