'use client'

import { useMutation, useQuery } from 'convex/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '../../../../../../../../convex/_generated/api'
import type { Id } from '../../../../../../../../convex/_generated/dataModel'
import styles from '../../../../portal.module.scss'
import { ActionPopover } from '~/components/ui/action-popover'

export default function ClientMoodboardsPage() {
  const params = useParams()
  const projectId = params?.projectId as Id<'projects'>
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setUserId(localStorage.getItem('portal_user_id'))
  }, [])

  const project = useQuery(
    api.projects.get,
    userId ? { projectId, userId: userId as Id<'users'> } : 'skip'
  )

  const moodboards = useQuery(
    api.moodboards.listByProject,
    userId && projectId ? { userId: userId as Id<'users'>, projectId } : 'skip'
  )

  const createMoodboard = useMutation(api.moodboards.create)
  const deleteMoodboard = useMutation(api.moodboards.remove)


  if (project === undefined || moodboards === undefined) {
    return <div className={styles.container}>Loading...</div>
  }
  if (project === null) {
    return <div className={styles.container}>Project not found</div>
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.landingContainer}
        style={{ display: 'block', padding: 'var(--space)' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space)'
          }}
        >
          <div>
            <Link
              href={`/admin/edit/${projectId}`}
              style={{
                color: '#a3a3a3',
                textDecoration: 'underline',
                fontSize: '0.875rem'
              }}
            >
              &larr; Back to Project
            </Link>
            <h1 className={styles.landingTitle} style={{ marginTop: '0.5rem' }}>
              Moodboards: {project.name}
            </h1>
          </div>
          <ActionPopover
            triggerLabel="+ Create Moodboard"
            inputPlaceholder="Enter moodboard name:"
            successMessage="Moodboard created"
            errorMessage="Failed to create moodboard"
            action={async (name) => {
              if (!userId) throw new Error('Not initialized')
              if (!name) throw new Error('Name is required')
              await createMoodboard({
                userId: userId as Id<'users'>,
                projectId,
                name
              })
            }}
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-base)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {moodboards.length === 0 ? (
            <p style={{ color: '#737373' }}>No moodboards created yet.</p>
          ) : (
            moodboards.map((mb: any) => (
              <div
                key={mb._id}
                style={{
                  border: '1px solid #262626',
                  padding: '1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#171717'
                }}
              >
                <div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                    {mb.name}
                  </h3>
                  <p style={{ color: '#737373', fontSize: '0.875rem' }}>
                    Status: {mb.isPublic ? 'Public' : 'Draft (Hidden)'} &bull;
                    Sections: {mb.sections.length}
                  </p>
                  {mb.isPublic && (
                    <p
                      style={{
                        color: '#4ade80',
                        fontSize: '0.875rem',
                        marginTop: '0.25rem'
                      }}
                    >
                      URL: /{project.slug}/{mb.slug}
                    </p>
                  )}
                </div>
                <div
                  style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
                >
                  <Link
                    href={`/admin/edit/moodboard/${projectId}/${mb._id}`}
                    style={{
                      color: 'var(--color-primary)',
                      textDecoration: 'underline'
                    }}
                  >
                    Edit
                  </Link>
                  <ActionPopover
                    triggerLabel="Delete"
                    successMessage="Moodboard deleted"
                    errorMessage="Failed to delete"
                    action={async () => {
                      if (!userId) throw new Error('Not initialized')
                      await deleteMoodboard({
                        userId: userId as Id<'users'>,
                        moodboardId: mb._id
                      })
                    }}
                    style={{
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
