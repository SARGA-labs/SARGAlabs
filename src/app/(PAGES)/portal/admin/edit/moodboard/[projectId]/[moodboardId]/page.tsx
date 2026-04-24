'use client'

import { useAction, useMutation, useQuery } from 'convex/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { UploadButton } from '~/lib/utils/uploadthing'
import { generateId } from '~/lib/utils/browser'
import { buildSubdomainUrl } from '~/lib/utils/url'
import { api } from '../../../../../../../../../convex/_generated/api'
import type { Id } from '../../../../../../../../../convex/_generated/dataModel'
import styles from '../../../../../portal.module.scss'
import { ActionPopover } from '~/components/ui/action-popover'
import { CopyLinkPopover } from '~/components/ui/CopyLinkPopover'

// ─── Slash Command Block Types ───────────────────────────────────────────
const BLOCK_TYPES = [
  { type: 'text', label: 'Text', icon: 'Aa', desc: 'Plain text block' },
  { type: 'image', label: 'Image / Audio', icon: '🖼', desc: 'Upload a file' },
  {
    type: 'link',
    label: 'Link Preview',
    icon: '🔗',
    desc: 'Embed a URL with preview'
  },
  {
    type: 'video',
    label: 'Video Embed',
    icon: '▶',
    desc: 'YouTube or Vimeo URL'
  },
  { type: 'divider', label: 'Divider', icon: '—', desc: 'Full-width separator' }
] as const

type SlashCommandInputProps = {
  onAddItem: (
    type: 'image' | 'video' | 'audio' | 'link' | 'text' | 'divider',
    content: string,
    previewData?: any
  ) => void
  onAddMultipleItems: (
    items: Array<{
      type: 'image' | 'video' | 'audio' | 'link' | 'text' | 'divider'
      content: string
      previewData?: any
    }>
  ) => void
  fetchLinkPreview: (args: { url: string }) => Promise<any>
}

function SlashCommandInput({
  onAddItem,
  onAddMultipleItems,
  fetchLinkPreview
}: SlashCommandInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeType, setActiveType] = useState<string | null>(null)
  const [secondaryValue, setSecondaryValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const secondaryRef = useRef<HTMLInputElement>(null)

  const filtered = BLOCK_TYPES.filter(
    (b) =>
      b.label.toLowerCase().includes(filterText.toLowerCase()) ||
      b.type.toLowerCase().includes(filterText.toLowerCase())
  )

  useEffect(() => {
    // Reset index when filter changes
    void filterText
    setSelectedIndex(0)
  }, [filterText])

  useEffect(() => {
    if (activeType && secondaryRef.current) {
      secondaryRef.current.focus()
    }
  }, [activeType])

  const handleSlashKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = filtered[selectedIndex]
        if (selected) selectBlockType(selected.type)
      } else if (e.key === 'Escape') {
        resetState()
      }
      return
    }

    if (e.key === 'Enter' && inputValue.trim() && !inputValue.startsWith('/')) {
      onAddItem('text', inputValue.trim())
      resetState()
    }
  }

  const handleInputChange = (val: string) => {
    setInputValue(val)
    if (val.startsWith('/')) {
      setShowMenu(true)
      setFilterText(val.slice(1))
    } else {
      setShowMenu(false)
      setFilterText('')
    }
  }

  const selectBlockType = (type: string) => {
    setShowMenu(false)
    setInputValue('')
    setFilterText('')
    if (type === 'divider') {
      onAddItem('divider', '---')
      resetState()
    } else {
      setActiveType(type)
    }
  }

  const handleSecondarySubmit = async () => {
    if (!activeType || !secondaryValue.trim()) return
    if (activeType === 'text') {
      onAddItem('text', secondaryValue.trim())
    } else if (activeType === 'video') {
      onAddItem('video', secondaryValue.trim())
    } else if (activeType === 'link') {
      setIsLoading(true)
      try {
        const preview = await fetchLinkPreview({ url: secondaryValue.trim() })
        onAddItem('link', secondaryValue.trim(), preview)
      } catch {
        onAddItem('link', secondaryValue.trim())
      }
      setIsLoading(false)
    }
    resetState()
  }

  const resetState = () => {
    setInputValue('')
    setShowMenu(false)
    setFilterText('')
    setSelectedIndex(0)
    setActiveType(null)
    setSecondaryValue('')
    setIsLoading(false)
    inputRef.current?.focus()
  }

  // Secondary input for text/video/link
  if (activeType === 'image') {
    return (
      <div
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            color: '#a3a3a3',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'monospace'
          }}
        >
          UPLOAD →
        </span>
        <UploadButton
          endpoint="moodboardMediaUploader"
          onClientUploadComplete={(res) => {
            if (res && res.length > 0) {
              const newItems = res.map((file) => ({
                type: file.name.match(/\.(mp3|wav|ogg)$/i)
                  ? ('audio' as const)
                  : ('image' as const),
                content: file.ufsUrl
              }))
              onAddMultipleItems(newItems)
              resetState()
            }
          }}
        />
        <button
          type="button"
          onClick={resetState}
          style={{
            background: 'none',
            border: 'none',
            color: '#737373',
            cursor: 'pointer',
            fontSize: '0.75rem',
            marginLeft: 'auto'
          }}
        >
          Cancel
        </button>
      </div>
    )
  }

  if (activeType && activeType !== 'image') {
    const placeholders: Record<string, string> = {
      text: 'Type your text and press Enter...',
      video: 'Paste YouTube or Vimeo URL...',
      link: 'Paste URL for preview...'
    }
    return (
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            color: '#a3a3a3',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap'
          }}
        >
          {activeType.toUpperCase()} →
        </span>
        <input
          ref={secondaryRef}
          type="text"
          placeholder={placeholders[activeType] || 'Enter content...'}
          value={secondaryValue}
          onChange={(e) => setSecondaryValue(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSecondarySubmit()
            if (e.key === 'Escape') resetState()
          }}
          style={{
            flex: 1,
            padding: '0.6rem 0.75rem',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            outline: 'none'
          }}
        />
        <button
          type="button"
          onClick={resetState}
          style={{
            background: 'none',
            border: 'none',
            color: '#737373',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          {isLoading ? '...' : 'Cancel'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Type / for commands, or just type text and press Enter..."
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleSlashKey}
        onFocus={() => {
          if (inputValue.startsWith('/')) setShowMenu(true)
        }}
        onBlur={() => setTimeout(() => setShowMenu(false), 150)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'rgba(255,255,255,0.04)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.95rem',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'background 0.15s'
        }}
      />

      {showMenu && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#1a1a1a',
            borderRadius: '8px',
            overflow: 'hidden',
            zIndex: 50,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
          }}
        >
          <div
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.65rem',
              color: '#737373',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'monospace'
            }}
          >
            BLOCKS
          </div>
          {filtered.map((block, i) => (
            <button
              key={block.type}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                selectBlockType(block.type)
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.6rem 0.75rem',
                background:
                  i === selectedIndex
                    ? 'rgba(255,255,255,0.06)'
                    : 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                transition: 'background 0.1s'
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}
              >
                {block.icon}
              </span>
              <div>
                <div style={{ fontWeight: 500 }}>{block.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#737373' }}>
                  {block.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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

type MoodboardSection = {
  id: string
  name: string
  items: MoodboardItem[]
}

export default function MoodboardEditPage() {
  const params = useParams()
  const projectId = params?.projectId as Id<'projects'>
  const moodboardId = params?.moodboardId as Id<'moodboards'>

  const [userId, setUserId] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  useEffect(() => {
    setUserId(localStorage.getItem('portal_user_id'))
  }, [])

  const project = useQuery(
    api.projects.get,
    userId ? { projectId, userId: userId as Id<'users'> } : 'skip'
  )

  const moodboard = useQuery(
    api.moodboards.get,
    userId ? { moodboardId, userId: userId as Id<'users'> } : 'skip'
  )

  const updateMoodboard = useMutation(api.moodboards.update)
  const fetchLinkPreview = useAction(api.linkPreview.fetchLinkPreview)

  const [localSections, setLocalSections] = useState<MoodboardSection[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (moodboard) {
      // deep clone to avoid mutating state
      setLocalSections(JSON.parse(JSON.stringify(moodboard.sections || [])))
      setIsPublic(moodboard.isPublic || false)
      if (moodboard.sections?.length > 0 && !activeSectionId) {
        setActiveSectionId(moodboard.sections[0]?.id || null)
      }
    }
  }, [moodboard, activeSectionId])

  const saveChanges = async (
    sectionsToSave = localSections,
    pub = isPublic
  ) => {
    if (!userId) return
    setSaving(true)
    try {
      await updateMoodboard({
        userId: userId as Id<'users'>,
        moodboardId,
        sections: sectionsToSave,
        isPublic: pub
      })
    } catch (err) {
      console.error('Save failed', err)
      throw new Error('Failed to save moodboard changes')
    } finally {
      setSaving(false)
    }
  }

  // ─── Section Management ────────────────────────────────────────────────
  const handleDeleteSection = async (sectionId: string) => {
    const newSections = localSections.filter((s) => s.id !== sectionId)
    setLocalSections(newSections)
    if (activeSectionId === sectionId) {
      setActiveSectionId(newSections[0]?.id || null)
    }
    await saveChanges(newSections, isPublic)
  }

  const handleRenameSection = async (sectionId: string, newName: string) => {
    const newSections = localSections.map((s) =>
      s.id === sectionId ? { ...s, name: newName } : s
    )
    setLocalSections(newSections)
    await saveChanges(newSections, isPublic)
  }

  // ─── Item Management ───────────────────────────────────────────────────
  const activeSection = localSections.find((s) => s.id === activeSectionId)

  const handleAddItem = async (
    type: 'image' | 'video' | 'audio' | 'link' | 'text' | 'divider',
    content: string,
    previewData?: any
  ) => {
    if (!activeSectionId) return

    const newItem: MoodboardItem = {
      id: generateId(),
      type,
      content,
      order: activeSection?.items.length || 0,
      linkPreview: previewData
    }

    const newSections = localSections.map((s) => {
      if (s.id === activeSectionId) {
        return { ...s, items: [...s.items, newItem] }
      }
      return s
    })

    setLocalSections(newSections)
    saveChanges(newSections, isPublic)
  }

  const handleAddMultipleItems = async (
    itemsToAdd: Array<{
      type: 'image' | 'video' | 'audio' | 'link' | 'text' | 'divider'
      content: string
      previewData?: any
    }>
  ) => {
    if (!activeSectionId) return

    let currentOrder = activeSection?.items.length || 0
    const newItems = itemsToAdd.map((item) => ({
      id: generateId(),
      type: item.type,
      content: item.content,
      order: currentOrder++,
      linkPreview: item.previewData
    }))

    const newSections = localSections.map((s) => {
      if (s.id === activeSectionId) {
        return { ...s, items: [...s.items, ...newItems] }
      }
      return s
    })

    setLocalSections(newSections)
    saveChanges(newSections, isPublic)
  }

  const handleDeleteItem = (itemId: string) => {
    const newSections = localSections.map((s) => {
      if (s.id === activeSectionId) {
        return { ...s, items: s.items.filter((i) => i.id !== itemId) }
      }
      return s
    })
    setLocalSections(newSections)
    saveChanges(newSections, isPublic)
  }

  const handleUpdateItemCaption = (itemId: string, caption: string) => {
    const newSections = localSections.map((s) => {
      if (s.id === activeSectionId) {
        return {
          ...s,
          items: s.items.map((i) => (i.id === itemId ? { ...i, caption } : i))
        }
      }
      return s
    })
    setLocalSections(newSections)
    // Debounce saving in a real app, but let's just update local state
  }

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (!activeSection) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= activeSection.items.length) return

    const newSections = localSections.map((s) => {
      if (s.id === activeSectionId) {
        const items = [...s.items]
        const temp = items[index]
        if (temp === undefined || items[newIndex] === undefined) return s
        items[index] = items[newIndex]!
        items[newIndex] = temp!
        // re-assign orders
        items.forEach((item, i) => {
          item.order = i
        })
        return { ...s, items }
      }
      return s
    })
    setLocalSections(newSections)
    saveChanges(newSections, isPublic)
  }

  if (project === undefined || moodboard === undefined) {
    return <div className={styles.container}>Loading...</div>
  }
  if (project === null || moodboard === null) {
    return <div className={styles.container}>Not found</div>
  }

  return (
    <div
      className={styles.container}
      style={{ maxWidth: '1200px', margin: '0 auto' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}
      >
        <div>
          <Link
            href={`/admin/edit/moodboard/${projectId}`}
            style={{
              color: '#a3a3a3',
              textDecoration: 'underline',
              fontSize: '0.875rem'
            }}
          >
            &larr; Back to Moodboards
          </Link>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginTop: '0.5rem',
              color: 'var(--color-primary)'
            }}
          >
            Editing: {moodboard.name}
          </h1>
          <p style={{ color: '#737373', fontSize: '0.875rem' }}>
            Project: {project.name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#a3a3a3',
              fontSize: '0.875rem'
            }}
          >
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => {
                setIsPublic(e.target.checked)
                saveChanges(localSections, e.target.checked)
              }}
            />
            Make Public
          </label>
          {moodboard.isPublic && (
            <CopyLinkPopover
              url={buildSubdomainUrl(
                'portal',
                `/${project.slug}/${moodboard.slug}`
              )}
              label="Copy Link"
            />
          )}
          <button
            type="button"
            onClick={() => saveChanges(localSections, isPublic)}
            disabled={saving}
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-base)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          gap: '2rem'
        }}
      >
        {/* ─── SIDEBAR: SECTIONS ─── */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem',
            height: 'fit-content'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Sections</h2>
            <ActionPopover
              triggerLabel="+"
              inputPlaceholder="Enter section name (e.g. Visuals):"
              successMessage="Section added"
              errorMessage="Failed to add section"
              action={async (name) => {
                if (!name) throw new Error('Name required')
                const newSections = [
                  ...localSections,
                  { id: generateId(), name, items: [] as MoodboardItem[] }
                ]
                setLocalSections(newSections)
                setActiveSectionId(
                  newSections[newSections.length - 1]?.id || null
                )
                await saveChanges(newSections, isPublic)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            />
          </div>

          {localSections.length === 0 ? (
            <p style={{ color: '#737373', fontSize: '0.875rem' }}>
              No sections. Add one to begin.
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              {localSections.map((section) => (
                <li
                  key={section.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background:
                      activeSectionId === section.id
                        ? '#262626'
                        : 'transparent',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setActiveSectionId(section.id)
                    }}
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 'inherit'
                    }}
                  >
                    {section.name}
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ActionPopover
                      triggerLabel="✎"
                      inputPlaceholder="Rename section:"
                      successMessage="Renamed"
                      errorMessage="Failed to rename"
                      action={async (n) => {
                        if (!n) throw new Error('Name required')
                        await handleRenameSection(section.id, n)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#a3a3a3',
                        cursor: 'pointer'
                      }}
                    />
                    <ActionPopover
                      triggerLabel="×"
                      successMessage="Deleted"
                      errorMessage="Failed to delete"
                      action={async () => {
                        await handleDeleteSection(section.id)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ─── MAIN: ACTIVE SECTION ITEMS ─── */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem'
          }}
        >
          {!activeSection ? (
            <p
              style={{ color: '#737373', textAlign: 'center', padding: '2rem' }}
            >
              Select or create a section to edit.
            </p>
          ) : (
            <>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}
              >
                {activeSection.name}
              </h2>

              {/* ─── Slash Command Input ─── */}
              <SlashCommandInput
                onAddItem={handleAddItem}
                onAddMultipleItems={handleAddMultipleItems}
                fetchLinkPreview={fetchLinkPreview}
              />

              {/* Items List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {activeSection.items.length === 0 ? (
                  <p style={{ color: '#737373', textAlign: 'center' }}>
                    No items in this section.
                  </p>
                ) : (
                  activeSection.items.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '8px'
                      }}
                    >
                      {/* Order controls */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'up')}
                          disabled={index === 0}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: index === 0 ? '#333' : '#a3a3a3',
                            cursor: 'pointer'
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'down')}
                          disabled={index === activeSection.items.length - 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            color:
                              index === activeSection.items.length - 1
                                ? '#333'
                                : '#a3a3a3',
                            cursor: 'pointer'
                          }}
                        >
                          ▼
                        </button>
                      </div>

                      {/* Item Preview */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              background: '#262626',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {item.type}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>

                        {item.type === 'image' && (
                          <img
                            src={item.content}
                            alt=""
                            style={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              borderRadius: '4px'
                            }}
                          />
                        )}
                        {item.type === 'video' && (
                          <p style={{ color: '#60a5fa' }}>
                            <a
                              href={item.content}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {item.content}
                            </a>
                          </p>
                        )}
                        {item.type === 'audio' && (
                          <audio
                            src={item.content}
                            controls
                            style={{ height: '32px' }}
                          >
                            <track kind="captions" />
                          </audio>
                        )}
                        {item.type === 'text' && (
                          <p
                            style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}
                          >
                            {item.content}
                          </p>
                        )}
                        {item.type === 'divider' && (
                          <hr
                            style={{ borderColor: '#262626', margin: '1rem 0' }}
                          />
                        )}
                        {item.type === 'link' && (
                          <div
                            style={{
                              border: 'none',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            <p
                              style={{
                                color: '#60a5fa',
                                fontSize: '0.875rem',
                                marginBottom: '0.5rem'
                              }}
                            >
                              <a
                                href={item.content}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {item.content}
                              </a>
                            </p>
                            {item.linkPreview && (
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                {item.linkPreview.image && (
                                  <img
                                    src={item.linkPreview.image}
                                    alt=""
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      objectFit: 'cover',
                                      borderRadius: '4px'
                                    }}
                                  />
                                )}
                                <div>
                                  <p
                                    style={{
                                      fontWeight: 'bold',
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    {item.linkPreview.title || 'No title'}
                                  </p>
                                  <p
                                    style={{
                                      color: '#a3a3a3',
                                      fontSize: '0.75rem',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {item.linkPreview.description}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {item.type !== 'divider' && item.type !== 'text' && (
                          <input
                            type="text"
                            placeholder="Add caption (optional)..."
                            value={item.caption || ''}
                            onChange={(e) =>
                              handleUpdateItemCaption(item.id, e.target.value)
                            }
                            onBlur={() => saveChanges()}
                            style={{
                              width: '100%',
                              marginTop: '0.5rem',
                              padding: '0.25rem 0.5rem',
                              background: 'transparent',
                              border: 'none',
                              borderBottom: '1px solid #262626',
                              color: '#a3a3a3',
                              fontSize: '0.875rem',
                              outline: 'none'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
