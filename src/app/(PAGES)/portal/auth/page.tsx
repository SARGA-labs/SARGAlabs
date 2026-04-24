'use client'

import {
  startAuthentication,
  startRegistration,
  browserSupportsWebAuthn
} from '@simplewebauthn/browser'
import { useAction, useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import styles from './auth.module.scss'

type AuthMode = 'client' | 'admin-passkey' | 'admin-password' | 'admin-register'

function clearPortalSession() {
  localStorage.removeItem('portal_user_id')
  localStorage.removeItem('portal_project_id')
  localStorage.removeItem('portal_slug')
}

function mapAuthError(err: unknown, mode: AuthMode): string {
  const message = err instanceof Error ? err.message : 'Failed to sign in'

  if (
    message.includes('Invalid access code') ||
    message.includes('Access code is required') ||
    message.includes('format')
  ) {
    return 'Invalid access code. Please check and try again.'
  }

  if (message.includes('Invalid password')) {
    return 'Invalid email or password.'
  }

  if (message.includes('Password is required for admin login')) {
    return mode === 'client'
      ? 'This account requires admin login. Click Admin login below.'
      : 'Password is required for admin login.'
  }

  if (message.includes('Admin user not found')) {
    return 'Admin account not found.'
  }

  if (
    message.includes('No passkey registered') ||
    message.includes('Credential not recognized')
  ) {
    return 'No passkey found for this account. Use password login first.'
  }

  if (message.includes('Origin') && message.includes('not allowed')) {
    return 'Passkeys are only available on the secure production portal domain.'
  }

  if (message.includes('Unauthorized')) {
    return 'You are not authorized for this action.'
  }

  return 'Sign in failed. Please try again.'
}

export default function PortalLogin() {
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<AuthMode>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [supportsPasskey, setSupportsPasskey] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // WebAuthn only works on HTTPS or exact "localhost" (not subdomains)
    const isSecure = window.location.protocol === 'https:'
    const isExactLocalhost = window.location.hostname === 'localhost'
    setSupportsPasskey(
      browserSupportsWebAuthn() && (isSecure || isExactLocalhost)
    )
  }, [])

  const signIn = useMutation(api.auth.signIn)
  const webauthnStartReg = useAction(api.webauthn.startRegistration)
  const webauthnFinishReg = useAction(api.webauthn.finishRegistration)
  const webauthnStartAuth = useAction(api.webauthn.startAuthentication)
  const webauthnFinishAuth = useAction(api.webauthn.finishAuthentication)

  // ─── Client Sign In ──────────────────────────────────────────────────
  const handleClientSignIn = async () => {
    const result = await signIn({ email, accessCode: accessCode || undefined })
    localStorage.setItem('portal_user_id', result.userId)
    localStorage.setItem('portal_project_id', result.projectId)
    localStorage.setItem('portal_slug', result.slug || '')
    router.push(`/${result.slug}`)
  }

  const handleLogout = async () => {
    setError('')
    setMessage('')
    try {
      await fetch('/api/auth', { method: 'POST' })
    } catch {
      // no-op: local cleanup still runs
    } finally {
      clearPortalSession()
      router.replace('/auth')
    }
  }

  // ─── Admin Password Sign In ──────────────────────────────────────────
  const handlePasswordSignIn = async () => {
    const result = await signIn({ email, password })
    localStorage.setItem('portal_user_id', result.userId)
    localStorage.setItem('portal_project_id', result.projectId)
    localStorage.setItem('portal_slug', result.slug || '')
    router.push('/admin')
  }

  // ─── Admin Passkey Sign In ───────────────────────────────────────────
  const handlePasskeySignIn = async () => {
    const origin = window.location.origin
    const { options, userId } = await webauthnStartAuth({ email, origin })
    const authResp = await startAuthentication({ optionsJSON: options })
    const result = await webauthnFinishAuth({
      userId: userId as Id<'users'>,
      response: authResp,
      origin
    })
    if (result.verified) {
      localStorage.setItem('portal_user_id', result.userId)
      localStorage.setItem('portal_project_id', result.projectId)
      localStorage.setItem('portal_slug', 'admin')
      router.push('/admin')
    }
  }

  // ─── Admin Passkey Registration ──────────────────────────────────────
  const handlePasskeyRegister = async () => {
    if (!password) {
      setError('Password is required to register a passkey.')
      return
    }
    const origin = window.location.origin
    const { options, userId } = await webauthnStartReg({
      email,
      password,
      origin
    })
    const regResp = await startRegistration({ optionsJSON: options })
    const result = await webauthnFinishReg({
      userId: userId as Id<'users'>,
      response: regResp,
      origin
    })
    if (result.verified) {
      setMessage('Passkey registered! You can now sign in with Touch ID.')
      setMode('admin-passkey')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      switch (mode) {
        case 'client':
          await handleClientSignIn()
          break
        case 'admin-passkey':
          await handlePasskeySignIn()
          break
        case 'admin-password':
          await handlePasswordSignIn()
          break
        case 'admin-register':
          await handlePasskeyRegister()
          break
      }
    } catch (err: unknown) {
      console.error(err)
      setError(mapAuthError(err, mode))
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = mode !== 'client'

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Client Portal</h2>
          <p className={styles.subtitle}>
            {mode === 'client' && 'Enter your access code to view your project'}
            {mode === 'admin-passkey' && 'Sign in with Touch ID'}
            {mode === 'admin-password' && 'Sign in with your password'}
            {mode === 'admin-register' && 'Register a passkey for this device'}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div>
              <label htmlFor="email-address" className={styles.label}>
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={
                  mode === 'admin-passkey' ? styles.inputFull : styles.inputTop
                }
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode === 'client' && (
              <div>
                <label htmlFor="access-code" className={styles.label}>
                  Access Code
                </label>
                <input
                  id="access-code"
                  name="accessCode"
                  type="text"
                  required
                  className={styles.inputBottom}
                  placeholder="SAR.Client-UUID"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                />
              </div>
            )}

            {(mode === 'admin-password' || mode === 'admin-register') && (
              <div>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={styles.inputBottom}
                  placeholder={
                    mode === 'admin-register'
                      ? 'Verify your password to register passkey'
                      : 'Password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {message && (
            <div
              style={{
                color: '#4ade80',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}
            >
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading
                ? 'Please wait...'
                : mode === 'admin-passkey'
                  ? 'Sign in with Touch ID'
                  : mode === 'admin-register'
                    ? 'Register Passkey'
                    : 'Sign in'}
            </button>
          </div>

          {/* Mode switchers */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <ModeLink
              onClick={handleLogout}
              label="Clear session"
              setError={setError}
            />
            {isAdmin ? (
              <>
                <ModeLink
                  onClick={() => setMode('client')}
                  label="Client login"
                  setError={setError}
                />
                {supportsPasskey && mode !== 'admin-passkey' && (
                  <ModeLink
                    onClick={() => setMode('admin-passkey')}
                    label="Use passkey"
                    setError={setError}
                  />
                )}
                {mode !== 'admin-password' && (
                  <ModeLink
                    onClick={() => setMode('admin-password')}
                    label="Use password"
                    setError={setError}
                  />
                )}
                {supportsPasskey && mode !== 'admin-register' && (
                  <ModeLink
                    onClick={() => setMode('admin-register')}
                    label="Register passkey"
                    setError={setError}
                  />
                )}
                {!supportsPasskey &&
                  (mode === 'admin-passkey' || mode === 'admin-register') && (
                    <p
                      style={{
                        color: '#f87171',
                        fontSize: '0.8rem',
                        textAlign: 'center'
                      }}
                    >
                      Passkeys require HTTPS. Use password for local dev.
                    </p>
                  )}
              </>
            ) : (
              <ModeLink
                onClick={() =>
                  setMode(supportsPasskey ? 'admin-passkey' : 'admin-password')
                }
                label="Admin login"
                setError={setError}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

function ModeLink({
  onClick,
  label,
  setError
}: {
  onClick: () => void
  label: string
  setError: (e: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => {
        setError('')
        onClick()
      }}
      style={{
        background: 'none',
        border: 'none',
        color: '#737373',
        cursor: 'pointer',
        fontSize: '0.85rem',
        textDecoration: 'underline'
      }}
    >
      {label}
    </button>
  )
}
