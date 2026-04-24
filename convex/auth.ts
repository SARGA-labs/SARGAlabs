import { v } from 'convex/values'
import { mutation } from './_generated/server'
import { hashPassword, verifyPassword } from './lib/passwords'

/**
 * Bootstrap the first admin user. Only works when no admins exist.
 * Call via CLI: bunx convex run auth:bootstrapAdmin '{"email":"...", "password":"..."}'
 */
export const bootstrapAdmin = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query('users').collect()
    const existingAdmin = allUsers.find((u) => u.role === 'admin')
    if (existingAdmin) {
      throw new Error('An admin already exists. Use setAdminPassword to reset.')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (!user) {
      throw new Error(
        'User not found. Sign in through the portal first, then run this again.'
      )
    }

    const passwordHash = await hashPassword(args.password)
    await ctx.db.patch(user._id, { role: 'admin', passwordHash })
    return { userId: user._id, email: user.email, role: 'admin' }
  }
})

/**
 * Set or reset an admin's password.
 * Call via CLI: bunx convex run auth:setAdminPassword '{"email":"...", "password":"..."}'
 */
export const setAdminPassword = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    if (args.password.length < 8) {
      throw new Error('Password must be at least 8 characters.')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (!user) throw new Error('User not found.')
    if (user.role !== 'admin') throw new Error('User is not an admin.')

    const passwordHash = await hashPassword(args.password)
    await ctx.db.patch(user._id, { passwordHash })
    return { success: true }
  }
})

export const signIn = mutation({
  args: {
    email: v.string(),
    accessCode: v.optional(v.string()),
    password: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // 1. Check if user is an admin — requires password, not access code
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (existingUser?.role === 'admin') {
      if (!args.password) {
        throw new Error('Password is required for admin login.')
      }
      if (!existingUser.passwordHash) {
        throw new Error(
          'Admin password not set. Run: bunx convex run auth:setAdminPassword'
        )
      }

      const valid = await verifyPassword(
        args.password,
        existingUser.passwordHash
      )
      if (!valid) {
        throw new Error('Invalid password.')
      }

      return {
        userId: existingUser._id,
        projectId: existingUser.projectId,
        slug: 'admin',
        isAdmin: true
      }
    }

    // 2. Non-admin flow requires access code
    if (!args.accessCode) {
      throw new Error('Access code is required.')
    }

    const codeRegex = /^SAR\.[a-zA-Z0-9]+-[a-f0-9-]+$/i
    if (!codeRegex.test(args.accessCode)) {
      throw new Error(
        'Invalid access code format. Expected SAR.[ClientName]-[UUID]'
      )
    }

    // 3. Find Project
    const project = await ctx.db
      .query('projects')
      .withIndex('by_accessCode', (q) => q.eq('accessCode', args.accessCode!))
      .first()

    if (!project) {
      throw new Error('Invalid access code. Project not found.')
    }

    // 4. Find or Create User
    if (existingUser) {
      if (existingUser.projectId !== project._id) {
        await ctx.db.patch(existingUser._id, {
          projectId: project._id,
          role: 'team_member'
        })
      }
      return {
        userId: existingUser._id,
        projectId: project._id,
        slug: project.slug,
        isAdmin: false
      }
    }

    const userId = await ctx.db.insert('users', {
      email: args.email,
      projectId: project._id,
      role: 'team_member',
      name: args.email.split('@')[0]
    })

    return {
      userId,
      projectId: project._id,
      slug: project.slug,
      isAdmin: false
    }
  }
})
