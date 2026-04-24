import { v } from 'convex/values'
import { internalMutation, internalQuery } from './_generated/server'

export const getAdminByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
    if (!user || user.role !== 'admin') return null
    return user
  }
})

export const getUserById = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  }
})

export const setChallenge = internalMutation({
  args: { userId: v.id('users'), challenge: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      currentChallenge: args.challenge || undefined
    })
  }
})

export const storeCredential = internalMutation({
  args: {
    userId: v.id('users'),
    credential: v.object({
      credentialId: v.string(),
      publicKey: v.string(),
      counter: v.number(),
      transports: v.optional(v.array(v.string()))
    })
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) throw new Error('User not found')

    const existing = user.webauthnCredentials || []
    await ctx.db.patch(args.userId, {
      webauthnCredentials: [...existing, args.credential]
    })
  }
})

export const updateCredentialCounter = internalMutation({
  args: {
    userId: v.id('users'),
    credentialId: v.string(),
    newCounter: v.number()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) throw new Error('User not found')

    const creds = (user.webauthnCredentials || []).map((c) => {
      if (c.credentialId === args.credentialId) {
        return { ...c, counter: args.newCounter }
      }
      return c
    })
    await ctx.db.patch(args.userId, { webauthnCredentials: creds })
  }
})
