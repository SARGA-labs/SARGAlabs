'use client'

import React, { useState } from 'react'
import s from './newsletter.module.scss'

export const NewsletterStatic = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        throw new Error('Subscription failed')
      }

      setStatus('success')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className={s.staticContainer}>
      {status === 'success' ? (
        <div className={`${s.successMessage} ${s.messageFadeIn}`}>
          <p>Subscribed.</p>
        </div>
      ) : (
        <form className={s.form} onSubmit={handleSubmit}>
          <input 
            type="email" 
            className={s.input} 
            placeholder="EMAIL" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button 
            type="submit" 
            className={s.submitButton}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
          {status === 'error' && <p className={s.messageFadeIn} style={{ color: 'var(--inspect-color)', fontSize: 'inherit' }}>{errorMessage}</p>}
        </form>
      )}
    </div>
  )
}
