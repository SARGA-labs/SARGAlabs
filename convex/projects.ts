import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import {
  authenticateUser,
  requireAdmin,
  requireProjectAccess
} from './lib/auth'

export const get = query({
  args: { projectId: v.id('projects'), userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.userId, args.projectId)
    return await ctx.db.get(args.projectId)
  }
})

export const getBySlug = query({
  args: { slug: v.string(), userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await authenticateUser(ctx, args.userId)
    const project = await ctx.db
      .query('projects')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()
    if (!project) return null

    // Admin can view any project; team members only their own
    if (
      user.role !== 'admin' &&
      user.projectId.toString() !== project._id.toString()
    ) {
      return null
    }
    return project
  }
})

export const create = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    clientName: v.string(),
    email: v.string(),
    price: v.string(),
    contractDetails: v.optional(v.string()),
    driveFolderId: v.string(),
    completedSteps: v.optional(
      v.object({
        serviceAgreement: v.boolean(),
        intake: v.boolean(),
        payment: v.boolean()
      })
    ),
    paymentDetails: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId)

    const uuid = crypto.randomUUID()
    const accessCode = `SAR.${args.clientName}-${uuid}`
    const slug = args.clientName.toLowerCase().replace(/\s+/g, '-')

    const projectId = await ctx.db.insert('projects', {
      name: args.name,
      clientName: args.clientName,
      email: args.email,
      price: args.price,
      contractDetails: args.contractDetails,
      slug,
      accessCode,
      driveFolderId: args.driveFolderId,
      status: 'Onboarding',
      timeline: [],
      onboardingStatus: 'pending',
      completedSteps: args.completedSteps,
      paymentDetails: args.paymentDetails
    })

    return { projectId, accessCode }
  }
})

export const update = mutation({
  args: {
    userId: v.id('users'),
    projectId: v.id('projects'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    price: v.optional(v.string()),
    status: v.optional(v.string()),
    onboardingStatus: v.optional(
      v.union(v.literal('pending'), v.literal('paid'), v.literal('verified'))
    ),
    driveFolderId: v.optional(v.string()),
    contractUrl: v.optional(v.string()),
    questionnaire: v.optional(
      v.array(
        v.object({
          id: v.string(),
          text: v.string(),
          type: v.string(),
          options: v.optional(v.array(v.string()))
        })
      )
    ),
    questionnaireAnswers: v.optional(v.any()),
    paymentDetails: v.optional(v.string()),
    paymentProofUrl: v.optional(v.string()),
    completedSteps: v.optional(
      v.object({
        serviceAgreement: v.boolean(),
        intake: v.boolean(),
        payment: v.boolean()
      })
    )
  },
  handler: async (ctx, args) => {
    const { userId, projectId, ...updates } = args
    const user = await requireProjectAccess(ctx, userId, projectId)

    // Non-admin users can only update questionnaire answers and payment proof
    if (user.role !== 'admin') {
      const allowed: Record<string, unknown> = {}
      if (updates.questionnaireAnswers !== undefined) {
        allowed.questionnaireAnswers = updates.questionnaireAnswers
      }
      if (updates.paymentProofUrl !== undefined) {
        allowed.paymentProofUrl = updates.paymentProofUrl
      }
      if (Object.keys(allowed).length > 0) {
        await ctx.db.patch(projectId, allowed)
      }
      return
    }

    await ctx.db.patch(projectId, updates)
  }
})

export const submitVerification = mutation({
  args: {
    userId: v.id('users'),
    projectId: v.id('projects')
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.userId, args.projectId)

    await ctx.db.patch(args.projectId, {
      onboardingStatus: 'verified',
      status: 'Active'
    })
  }
})

export const addTimelineItem = mutation({
  args: {
    userId: v.id('users'),
    projectId: v.id('projects'),
    title: v.string(),
    date: v.string(),
    status: v.union(
      v.literal('upcoming'),
      v.literal('in-progress'),
      v.literal('completed')
    ),
    description: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId)

    const project = await ctx.db.get(args.projectId)
    if (!project) throw new Error('Project not found')

    const newItem = {
      id: crypto.randomUUID(),
      title: args.title,
      date: args.date,
      status: args.status,
      description: args.description
    }

    await ctx.db.patch(args.projectId, {
      timeline: [...(project.timeline || []), newItem]
    })

    await ctx.db.insert('activities', {
      projectId: args.projectId,
      type: 'timeline_update',
      message: `New timeline item added: ${args.title}`,
      timestamp: Date.now(),
      actor: 'Admin',
      metadata: { timelineItemId: newItem.id }
    })
  }
})

export const updateTimelineItem = mutation({
  args: {
    userId: v.id('users'),
    projectId: v.id('projects'),
    itemId: v.string(),
    status: v.union(
      v.literal('upcoming'),
      v.literal('in-progress'),
      v.literal('completed')
    )
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId)

    const project = await ctx.db.get(args.projectId)
    if (!project) throw new Error('Project not found')

    const newTimeline = (project.timeline || []).map(
      (item: {
        id: string
        title: string
        date: string
        status: 'upcoming' | 'in-progress' | 'completed'
        description?: string
      }) => {
        if (item.id === args.itemId) {
          return { ...item, status: args.status }
        }
        return item
      }
    )

    await ctx.db.patch(args.projectId, {
      timeline: newTimeline
    })

    const item = project.timeline.find(
      (i: { id: string; title: string }) => i.id === args.itemId
    )

    await ctx.db.insert('activities', {
      projectId: args.projectId,
      type: 'timeline_update',
      message: `Timeline item updated: ${item?.title || 'Unknown'} -> ${args.status}`,
      timestamp: Date.now(),
      actor: 'Admin',
      metadata: { timelineItemId: args.itemId }
    })
  }
})

export const list = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId)
    return await ctx.db.query('projects').order('desc').collect()
  }
})
