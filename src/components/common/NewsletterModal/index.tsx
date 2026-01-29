'use client'

import React, { useState, useEffect } from 'react'
import s from './newsletter.module.scss'

export const NewsletterModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Open automatically after 3 seconds, but only once per session
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('sarga_newsletter_seen')
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        sessionStorage.setItem('sarga_newsletter_seen', 'true')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

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
      setTimeout(() => {
        setIsOpen(false)
        setStatus('idle')
        setEmail('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className={`${s.modalOverlay} ${isOpen ? s.open : ''}`} onClick={() => setIsOpen(false)}>
      <div className={s.modalContent} onClick={e => e.stopPropagation()}>
        <button className={s.closeButton} onClick={() => setIsOpen(false)}>&times;</button>
        
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
    </div>
  )
}
