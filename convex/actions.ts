'use node'

import { v } from 'convex/values'
import { Resend } from 'resend'
import { action } from './_generated/server'
import { internal } from './_generated/api'

export const sendProjectInvite = action({
  args: {
    userId: v.id('users'),
    email: v.string(),
    projectName: v.string(),
    accessCode: v.string()
  },
  handler: async (ctx, args) => {
    // Validate admin access via internal query
    await ctx.runQuery(internal.users.validateAdmin, {
      userId: args.userId
    })

    const resend = new Resend(process.env.RESEND_API_KEY)

    try {
      const { data, error } = await resend.emails.send({
        from: 'Sarga <portal@updates.outdated.site>',
        to: [args.email],
        subject: `Welcome to ${args.projectName} - Sarga Labs`,
        html: `
          <h1>Welcome to Sarga Labs</h1>
          <p>You have been invited to join the project: <strong>${args.projectName}</strong>.</p>
          <p>Your Access Code is: <code>${args.accessCode}</code></p>
          <p>Login here: <a href="https://portal.sar.ga/auth">Client Portal</a></p>
        `
      })

      if (error) {
        console.error('Resend Error:', error)
        throw new Error('Failed to send email')
      }

      return data
    } catch (err) {
      console.error(err)
      throw new Error('Failed to send email')
    }
  }
})
