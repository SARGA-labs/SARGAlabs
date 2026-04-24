import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    clientName: v.optional(v.string()), // Original client name used for slug/access code
    email: v.string(), // Client Email
    price: v.string(), // Project Price
    contractDetails: v.optional(v.string()), // HTML/Markdown contract
    slug: v.string(),
    accessCode: v.string(), // Format: SAR.[clientName]-[uuid]
    driveFolderId: v.string(),
    contractUrl: v.optional(v.string()), // UploadThing URL
    paymentProofUrl: v.optional(v.string()), // UploadThing URL for proof of payment
    questionnaire: v.optional(
      v.array(
        v.object({
          id: v.string(),
          text: v.string(),
          type: v.string(), // "text", "long_text", "select"
          options: v.optional(v.array(v.string()))
        })
      )
    ),
    questionnaireAnswers: v.optional(v.any()),
    paymentDetails: v.optional(v.string()),
    status: v.string(),
    timeline: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        date: v.string(),
        status: v.union(
          v.literal('upcoming'),
          v.literal('in-progress'),
          v.literal('completed')
        ),
        description: v.optional(v.string())
      })
    ), // JSON data for timeline
    onboardingStatus: v.union(
      v.literal('pending'),
      v.literal('paid'),
      v.literal('verified')
    ),
    completedSteps: v.optional(
      v.object({
        serviceAgreement: v.boolean(),
        intake: v.boolean(),
        payment: v.boolean()
      })
    )
  })
    .index('by_accessCode', ['accessCode'])
    .index('by_slug', ['slug']),

  activities: defineTable({
    projectId: v.id('projects'),
    type: v.union(
      v.literal('file_upload'),
      v.literal('timeline_update'),
      v.literal('status_change'),
      v.literal('message')
    ),
    message: v.string(),
    timestamp: v.number(),
    actor: v.string(), // "Admin" or "Client"
    metadata: v.optional(v.any())
  }).index('by_projectId', ['projectId']),

  users: defineTable({
    email: v.string(),
    projectId: v.id('projects'),
    role: v.union(v.literal('admin'), v.literal('team_member')),
    name: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    currentChallenge: v.optional(v.string()),
    webauthnCredentials: v.optional(
      v.array(
        v.object({
          credentialId: v.string(),
          publicKey: v.string(),
          counter: v.number(),
          transports: v.optional(v.array(v.string()))
        })
      )
    )
  }).index('by_email', ['email']),

  moodboards: defineTable({
    projectId: v.id('projects'),
    name: v.string(),
    slug: v.string(),
    sections: v.array(
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
    ),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_projectId', ['projectId'])
    .index('by_slug', ['projectId', 'slug']),

  research_files: defineTable({
    path: v.string(),
    name: v.string(),
    mime: v.optional(v.string()),
    size: v.optional(v.number()),
    hash: v.optional(v.string()),
    storage_key: v.string(),
    created_at: v.number(),
    modified_at: v.optional(v.number()),
    uploaded_at: v.number(),
    tags: v.optional(v.array(v.string())),
    content_text: v.optional(v.string()),
    parent_folder: v.optional(v.string()),
    description: v.optional(v.string()),
    related_ids: v.optional(v.array(v.string()))
  })
    .index('by_path', ['path'])
    .index('by_folder', ['parent_folder'])
    .index('by_tag', ['tags'])
    .index('by_hash', ['hash'])
    .searchIndex('search_name', {
      searchField: 'name',
      filterFields: ['parent_folder']
    })
})
