import { v } from 'convex/values'
import { internalMutation, internalQuery, query } from './_generated/server'
import { authenticateUser } from './lib/auth'

export const get = query({
  args: { id: v.id('users'), userId: v.id('users') },
  handler: async (ctx, args) => {
    await authenticateUser(ctx, args.userId)
    return await ctx.db.get(args.id)
  }
})

/** List all users (internal only, for debugging/admin) */
export const listAll = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  }
})

/** Promote a user to admin by email (internal only) */
export const promoteToAdmin = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
    if (!user) return { error: 'User not found' }
    await ctx.db.patch(user._id, { role: 'admin' })
    return { success: true, email: user.email }
  }
})

/**
 * Internal query used by actions (via ctx.runQuery) to validate admin access.
 * Not callable from the client.
 */
export const validateAdmin = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) throw new Error('Unauthorized: Invalid user')
    if (user.role !== 'admin')
      throw new Error('Unauthorized: Admin access required')
    return user
  }
})
