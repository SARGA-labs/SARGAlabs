import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    email: v.string(), // Client Email
    price: v.string(), // Project Price
    contractDetails: v.optional(v.string()), // HTML/Markdown contract
    slug: v.string(),
    accessCode: v.string(), // Format: SAR.[clientName]-[uuid]
    driveFolderId: v.string(),
    status: v.string(),
    timeline: v.array(v.object({
      id: v.string(),
      title: v.string(),
      date: v.string(),
      status: v.union(v.literal("upcoming"), v.literal("in-progress"), v.literal("completed")),
      description: v.optional(v.string()),
    })), // JSON data for timeline
    onboardingStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("verified")
    ),
    completedSteps: v.optional(v.object({
      serviceAgreement: v.boolean(),
      intake: v.boolean(),
      payment: v.boolean(),
    })),
  }).index("by_accessCode", ["accessCode"]),

  activities: defineTable({
    projectId: v.id("projects"),
    type: v.union(v.literal("file_upload"), v.literal("timeline_update"), v.literal("status_change"), v.literal("message")),
    message: v.string(),
    timestamp: v.number(),
    actor: v.string(), // "Admin" or "Client"
    metadata: v.optional(v.any()),
  }).index("by_projectId", ["projectId"]),
  
  users: defineTable({
    email: v.string(),
    projectId: v.id("projects"),
    role: v.union(v.literal("admin"), v.literal("team_member")),
    name: v.optional(v.string()),
  }).index("by_email", ["email"]),
});
