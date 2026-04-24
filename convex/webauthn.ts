'use node'

import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { internal } from './_generated/api'
import { action } from './_generated/server'
import { verifyPassword } from './lib/passwords'

type WebAuthnCred = {
  credentialId: string
  publicKey: string
  counter: number
  transports?: string[]
}

type AdminUser = {
  _id: Id<'users'>
  email: string
  name?: string
  role: 'admin' | 'team_member'
  projectId: Id<'projects'>
  currentChallenge?: string
  passwordHash?: string
  webauthnCredentials?: WebAuthnCred[]
} | null

const RP_NAME = 'Sarga Portal'

/**
 * Allowed origins and their corresponding RP IDs.
 * WebAuthn requires HTTPS (except exact localhost).
 * Subdomain dev (portal.localhost, portal.sar.local) can NOT use passkeys.
 * Only production HTTPS is supported.
 */
const ALLOWED_ORIGINS: Record<string, string> = {
  'https://portal.sar.ga': 'sar.ga'
}

function getRpConfig(clientOrigin: string) {
  const rpId = ALLOWED_ORIGINS[clientOrigin]
  if (!rpId) {
    throw new Error(
      `Origin "${clientOrigin}" is not allowed. Valid origins: ${Object.keys(ALLOWED_ORIGINS).join(', ')}`
    )
  }
  return { rpId, rpName: RP_NAME, origin: clientOrigin }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const helpers = internal.webauthnHelpers as any

// ─── Registration ────────────────────────────────────────────────────────────

export const startRegistration = action({
  args: {
    email: v.string(),
    password: v.string(),
    origin: v.string()
  },
  handler: async (ctx, args) => {
    // 1. Find admin user
    const user: AdminUser = await ctx.runQuery(helpers.getAdminByEmail, {
      email: args.email
    })
    if (!user) {
      throw new Error('Admin user not found.')
    }

    // 2. Verify password before allowing passkey registration
    if (!user.passwordHash) {
      throw new Error('Set a password first before registering a passkey.')
    }
    const valid = await verifyPassword(args.password, user.passwordHash)
    if (!valid) {
      throw new Error('Invalid password.')
    }

    // 3. Build RP config from client origin
    const { rpId, rpName } = getRpConfig(args.origin)

    const existingCreds = (user.webauthnCredentials || []).map((c) => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransportFuture[] | undefined
    }))

    const options = await generateRegistrationOptions({
      rpName,
      rpID: rpId,
      userName: user.email,
      userDisplayName: user.name || user.email,
      attestationType: 'none',
      excludeCredentials: existingCreds,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred'
      }
    })

    await ctx.runMutation(helpers.setChallenge, {
      userId: user._id,
      challenge: options.challenge
    })

    return { options, userId: user._id }
  }
})

export const finishRegistration = action({
  args: {
    userId: v.id('users'),
    response: v.any(),
    origin: v.string()
  },
  handler: async (ctx, args) => {
    const user: AdminUser = await ctx.runQuery(helpers.getUserById, {
      userId: args.userId
    })
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized')
    }
    if (!user.currentChallenge) {
      throw new Error(
        'No registration challenge found. Start registration first.'
      )
    }

    const { rpId, origin } = getRpConfig(args.origin)

    const verification = await verifyRegistrationResponse({
      response: args.response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId
    })

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error('Registration verification failed.')
    }

    const { credential } = verification.registrationInfo

    await ctx.runMutation(helpers.storeCredential, {
      userId: args.userId,
      credential: {
        credentialId: Buffer.from(credential.id).toString('base64url'),
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        transports: args.response.response.transports || []
      }
    })

    await ctx.runMutation(helpers.setChallenge, {
      userId: args.userId,
      challenge: ''
    })

    return { verified: true }
  }
})

// ─── Authentication ──────────────────────────────────────────────────────────

export const startAuthentication = action({
  args: {
    email: v.string(),
    origin: v.string()
  },
  handler: async (ctx, args) => {
    const user: AdminUser = await ctx.runQuery(helpers.getAdminByEmail, {
      email: args.email
    })
    if (!user) {
      throw new Error('Admin user not found.')
    }

    const creds = user.webauthnCredentials || []
    if (creds.length === 0) {
      throw new Error(
        'No passkey registered. Use password login or register a passkey first.'
      )
    }

    const { rpId } = getRpConfig(args.origin)

    const options = await generateAuthenticationOptions({
      rpID: rpId,
      allowCredentials: creds.map((c) => ({
        id: c.credentialId,
        transports: c.transports as AuthenticatorTransportFuture[] | undefined
      })),
      userVerification: 'preferred'
    })

    await ctx.runMutation(helpers.setChallenge, {
      userId: user._id,
      challenge: options.challenge
    })

    return { options, userId: user._id }
  }
})

export const finishAuthentication = action({
  args: {
    userId: v.id('users'),
    response: v.any(),
    origin: v.string()
  },
  handler: async (ctx, args) => {
    const user: AdminUser = await ctx.runQuery(helpers.getUserById, {
      userId: args.userId
    })
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized')
    }
    if (!user.currentChallenge) {
      throw new Error('No authentication challenge found.')
    }

    const creds = user.webauthnCredentials || []
    const matchedCred = creds.find((c) => c.credentialId === args.response.id)
    if (!matchedCred) {
      throw new Error('Credential not recognized.')
    }

    const { rpId, origin } = getRpConfig(args.origin)

    const verification = await verifyAuthenticationResponse({
      response: args.response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      credential: {
        id: matchedCred.credentialId,
        publicKey: Buffer.from(matchedCred.publicKey, 'base64url'),
        counter: matchedCred.counter,
        transports: matchedCred.transports as
          | AuthenticatorTransportFuture[]
          | undefined
      }
    })

    if (!verification.verified) {
      throw new Error('Authentication failed.')
    }

    await ctx.runMutation(helpers.updateCredentialCounter, {
      userId: args.userId,
      credentialId: matchedCred.credentialId,
      newCounter: verification.authenticationInfo.newCounter
    })

    await ctx.runMutation(helpers.setChallenge, {
      userId: args.userId,
      challenge: ''
    })

    return {
      verified: true,
      userId: user._id,
      projectId: user.projectId,
      slug: 'admin',
      isAdmin: true
    }
  }
})
