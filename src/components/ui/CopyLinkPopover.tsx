'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { copyToClipboard } from '~/lib/utils/browser'

export function CopyLinkPopover({
  url,
  label = 'Copy Link'
}: {
  url: string
  label?: string
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  const handleCopy = async () => {
    const ok = await copyToClipboard(url)
    setStatus(ok ? 'copied' : 'failed')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        height: 32,
        padding: '0 16px',
        borderRadius: 9999,
        border:
          status === 'copied'
            ? '1px solid #4ade80'
            : status === 'failed'
              ? '1px solid #ef4444'
              : '1px solid var(--color-primary, #fff)',
        background: 'transparent',
        color:
          status === 'copied'
            ? '#4ade80'
            : status === 'failed'
              ? '#ef4444'
              : 'var(--color-primary, #fff)',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease'
      }}
    >
      {status === 'copied' ? (
        <>
          <Check size={14} /> COPIED
        </>
      ) : status === 'failed' ? (
        'FAILED'
      ) : (
        <>
          <Copy size={14} /> {label}
        </>
      )}
    </button>
  )
}
