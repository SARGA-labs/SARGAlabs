/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import p from './css/_password.module.scss'
const PasswordProtect = () => {
  const [password, setPassword] = useState('')
  const [passwordIncorrect, setPasswordIncorrect] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/password`, {
        body: JSON.stringify({ password }),
        headers: { 'Content-Type': 'application/json' },
        method: 'post'
      })

      if (response.status !== 200) {
        setPasswordIncorrect(true)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={p['password-modal']}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoComplete="off"
          autoFocus
        />
        <button type="submit">{loading ? 'Loading' : 'Submit'}</button>
        {passwordIncorrect && <p>Password incorrect</p>}
      </form>
    </div>
  )
}

export default PasswordProtect
