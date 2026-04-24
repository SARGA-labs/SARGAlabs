'use client'

import { useQuery } from 'convex/react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '../../../../../../convex/_generated/api'

type MoodboardItem = {
  id: string
  type: 'image' | 'video' | 'audio' | 'link' | 'text' | 'divider'
  content: string
  caption?: string
  order: number
  linkPreview?: {
    title?: string
    description?: string
    image?: string
  }
}

export default function PublicMoodboardPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const projectSlug = params?.clientName as string
  const moodboardSlug = params?.moodboardSlug as string

  const [accessCode, setAccessCode] = useState('')
  const [hasEnteredCode, setHasEnteredCode] = useState(false)

  // In a real app we might store accessCode for the moodboard session too,
  // but let's check if there's a stored project code in localStorage first.
  useEffect(() => {
    const storedCode = localStorage.getItem('portal_access_code_cache')
    if (storedCode) {
      setAccessCode(storedCode)
      setHasEnteredCode(true)
    }
  }, [])

  const result = useQuery(
    api.moodboards.getPublic,
    hasEnteredCode ? { projectSlug, moodboardSlug, accessCode } : 'skip'
  )

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = (document.getElementById('accessCodeInput') as HTMLInputElement)
      .value
    if (val) {
      setAccessCode(val)
      setHasEnteredCode(true)
      localStorage.setItem('portal_access_code_cache', val)
    }
  }

  // Handle Tabs
  const activeTab = searchParams?.get('tab')
  const activeSection =
    (result?.success &&
      result.moodboard?.sections?.find((s: any) => s.id === activeTab)) ||
    (result?.success ? result.moodboard?.sections?.[0] : undefined)

  useEffect(() => {
    if (
      result?.success &&
      result.moodboard?.sections &&
      result.moodboard.sections.length > 0 &&
      !activeTab
    ) {
      router.replace(
        `/${projectSlug}/${moodboardSlug}?tab=${result.moodboard.sections[0]?.id}`
      )
    }
  }, [result, activeTab, projectSlug, moodboardSlug, router])

  if (!hasEnteredCode) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-base)',
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-system)'
        }}
      >
        <form
          onSubmit={handleAuthSubmit}
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            padding: '2rem',
            width: '100%',
            maxWidth: '400px'
          }}
        >
          <h1
            style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}
          >
            Moodboard Access
          </h1>
          <p
            style={{ fontSize: '0.875rem', marginBottom: '2rem', opacity: 0.6 }}
          >
            Please enter your project access code.
          </p>
          <input
            id="accessCodeInput"
            type="text"
            placeholder="SAR.Client-UUID"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '4px',
              color: 'var(--color-primary)',
              marginBottom: '1rem',
              fontFamily: 'var(--font-system)'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'var(--color-primary)',
              color: 'var(--color-base)',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'var(--font-system)'
            }}
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  if (result === undefined) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-base)',
          color: 'var(--color-primary)'
        }}
      >
        Loading...
      </div>
    )
  }

  if (result === null || !result.success) {
    const isInvalidCode =
      result && !result.success && result.error === 'Invalid access code'

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-base)',
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-system)'
        }}
      >
        <div
          style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px' }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: isInvalidCode ? '#ef4444' : 'inherit'
            }}
          >
            {isInvalidCode ? 'Invalid Access Code' : 'Access Denied'}
          </h2>
          <p style={{ opacity: 0.6, marginBottom: '2rem' }}>
            {isInvalidCode
              ? 'The project access code you entered is incorrect. Please try again.'
              : result?.error || 'Moodboard not found or not public.'}
          </p>
          {isInvalidCode && (
            <button
              onClick={() => {
                setHasEnteredCode(false)
                setAccessCode('')
                localStorage.removeItem('portal_access_code_cache')
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--color-primary)',
                color: 'var(--color-base)',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'var(--font-system)'
              }}
            >
              Enter Code Again
            </button>
          )}
        </div>
      </div>
    )
  }

  const moodboard = result.moodboard

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-base)',
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-system)'
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '2rem',
          borderBottom: 'none'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            {moodboard.name}
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              opacity: 0.6,
              marginTop: '0.5rem',
              fontFamily: 'monospace'
            }}
          >
            MOODBOARD &bull; SARGA LABS
          </p>
        </div>
      </header>

      {/* Tabs */}
      <nav
        style={{
          borderBottom: '1px solid var(--color-primary)',
          position: 'sticky',
          top: 0,
          background: 'var(--color-base)',
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          {moodboard.sections.map((s: any) => (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                router.push(`/${projectSlug}/${moodboardSlug}?tab=${s.id}`)
              }
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                border: 'none',
                color:
                  activeSection?.id === s.id
                    ? 'var(--color-primary)'
                    : 'rgba(255,255,255,0.4)',
                fontWeight: activeSection?.id === s.id ? 'bold' : 'normal',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                fontSize: '0.875rem'
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {!activeSection || activeSection.items.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem',
              opacity: 0.4,
              border: '1px dashed var(--color-primary)'
            }}
          >
            [ NO ITEMS IN THIS SECTION ]
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
              alignItems: 'start'
            }}
          >
            {activeSection.items.map((item: MoodboardItem) => (
              <div
                key={item.id}
                style={{
                  breakInside: 'avoid',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                {item.type === 'image' && (
                  <div
                    style={{
                      border: '1px solid var(--color-primary)',
                      padding: '0.5rem'
                    }}
                  >
                    <img
                      src={item.content}
                      alt={item.caption || 'Moodboard image'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                  </div>
                )}

                {item.type === 'video' && (
                  <div
                    style={{
                      border: '1px solid var(--color-primary)',
                      padding: '0.5rem'
                    }}
                  >
                    {/* Simple iframe for YouTube/Vimeo, or raw video tag */}
                    {item.content.includes('youtube.com') ||
                    item.content.includes('youtu.be') ? (
                      <div
                        style={{ position: 'relative', paddingTop: '56.25%' }}
                      >
                        <iframe
                          src={item.content
                            .replace('watch?v=', 'embed/')
                            .replace('youtu.be/', 'www.youtube.com/embed/')}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0
                          }}
                          allowFullScreen
                          title="Video"
                        />
                      </div>
                    ) : item.content.includes('vimeo.com') ? (
                      <div
                        style={{ position: 'relative', paddingTop: '56.25%' }}
                      >
                        <iframe
                          src={item.content.replace(
                            'vimeo.com/',
                            'player.vimeo.com/video/'
                          )}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0
                          }}
                          allowFullScreen
                          title="Video"
                        />
                      </div>
                    ) : (
                      <video
                        src={item.content}
                        controls
                        style={{ width: '100%', display: 'block' }}
                      >
                        <track kind="captions" />
                      </video>
                    )}
                  </div>
                )}

                {item.type === 'audio' && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      padding: '1rem'
                    }}
                  >
                    <audio
                      src={item.content}
                      controls
                      style={{ width: '100%' }}
                    >
                      <track kind="captions" />
                    </audio>
                  </div>
                )}

                {item.type === 'link' && (
                  <a
                    href={item.content}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      transition: 'opacity 0.2s',
                      overflow: 'hidden'
                    }}
                  >
                    {item.linkPreview?.image && (
                      <div
                        style={{
                          borderBottom: 'none'
                        }}
                      >
                        <img
                          src={item.linkPreview.image}
                          alt=""
                          style={{
                            width: '100%',
                            height: '160px',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      </div>
                    )}
                    <div style={{ padding: '1rem' }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          marginBottom: '0.25rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.linkPreview?.title ||
                          new URL(item.content).hostname}
                      </p>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          opacity: 0.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.linkPreview?.description || item.content}
                      </p>
                    </div>
                  </a>
                )}

                {item.type === 'text' && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      padding: '1.5rem'
                    }}
                  >
                    <p
                      style={{
                        fontSize: '1.125rem',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5
                      }}
                    >
                      {item.content}
                    </p>
                  </div>
                )}

                {item.type === 'divider' && (
                  <hr
                    style={{
                      gridColumn: '1 / -1',
                      width: '100%',
                      border: 'none',
                      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                      margin: '2rem 0'
                    }}
                  />
                )}

                {item.caption &&
                  item.type !== 'divider' &&
                  item.type !== 'text' && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        opacity: 0.6,
                        fontFamily: 'monospace',
                        marginTop: '0.25rem'
                      }}
                    >
                      {item.caption}
                    </p>
                  )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
