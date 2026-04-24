'use client'

import { useEffect, useRef, useState } from 'react'

type Status = 'idle' | 'input' | 'loading' | 'success' | 'error'

export function ActionPopover({
  triggerLabel,
  action,
  inputPlaceholder,
  successMessage = 'Done',
  errorMessage = 'Failed',
  style
}: {
  triggerLabel: string | React.ReactNode
  action: (inputValue?: string) => Promise<void>
  inputPlaceholder?: string
  successMessage?: string
  errorMessage?: string
  style?: React.CSSProperties
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [inputValue, setInputValue] = useState('')
  const [errText, setErrText] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
        setStatus('idle')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputPlaceholder && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, inputPlaceholder])

  const handleAction = async () => {
    setStatus('loading')
    try {
      await action(inputPlaceholder ? inputValue : undefined)
      setStatus('success')
      setInputValue('')
      setTimeout(() => {
        setIsOpen(false)
        setStatus('idle')
      }, 1500)
    } catch (err: any) {
      setStatus('error')
      setErrText(err.message || errorMessage)
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    }
  }

  const handleClick = () => {
    if (inputPlaceholder) {
      // Needs input - open the dropdown
      setIsOpen(true)
      setStatus('input')
    } else {
      // No input needed - just confirm inline
      if (status === 'idle') {
        setIsOpen(true)
        setStatus('input') // shows "confirm?" state
      }
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          height: 32,
          padding: '0 16px',
          borderRadius: 9999,
          border: '1px solid var(--color-primary, #fff)',
          background: 'transparent',
          color: 'var(--color-primary, #fff)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          ...style
        }}
      >
        {status === 'loading'
          ? '...'
          : status === 'success'
            ? successMessage
            : status === 'error'
              ? errText
              : triggerLabel}
      </button>

      {isOpen && status === 'input' && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 50,
            background: 'var(--color-base, #000)',
            border: '1px solid var(--color-primary, #fff)',
            borderRadius: 8,
            padding: 12,
            minWidth: 240,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
        >
          {inputPlaceholder ? (
            <>
              <input
                ref={inputRef}
                type="text"
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue) handleAction()
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 12px',
                  color: 'var(--color-primary, #fff)',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleAction}
                style={{
                  background: 'var(--color-primary, #fff)',
                  color: 'var(--color-base, #000)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Confirm
              </button>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13
              }}
            >
              <span style={{ opacity: 0.6 }}>Confirm?</span>
              <button
                type="button"
                onClick={handleAction}
                style={{
                  background: 'var(--color-primary, #fff)',
                  color: 'var(--color-base, #000)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setStatus('idle')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#737373',
                  cursor: 'pointer',
                  fontSize: 11
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
