import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

/**
 * Validate a user ID and return the user document.
 * Throws if the user does not exist.
 *
 * NOTE: This provides basic access control by requiring a valid user ID.
 * For production, upgrade to proper auth (Clerk, Auth.js, etc.) using
 * ctx.auth.getUserIdentity() instead of trusting client-provided IDs.
 */
export async function authenticateUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>
) {
  const user = await ctx.db.get(userId)
  if (!user) throw new Error('Unauthorized: Invalid user')
  return user
}

/**
 * Validate user is an admin. Throws if not.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>
) {
  const user = await authenticateUser(ctx, userId)
  if (user.role !== 'admin')
    throw new Error('Unauthorized: Admin access required')
  return user
}

/**
 * Validate user has access to a specific project.
 * Admins can access any project. Team members can only access their own.
 */
export async function requireProjectAccess(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>,
  projectId: Id<'projects'>
) {
  const user = await authenticateUser(ctx, userId)
  if (user.role === 'admin') return user
  if (user.projectId.toString() !== projectId.toString()) {
    throw new Error('Unauthorized: No access to this project')
  }
  return user
}
