'use client'

import { useQuery } from 'convex/react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import s from '~/components/research/mainPanel.module.scss'
import { useWorkspaceModal } from '~/components/research/WorkspaceModalContext'
import { api } from '../../../../../convex/_generated/api'

function SearchContent() {
  const params = useSearchParams()
  const q = params.get('q') || ''
  const files = useQuery(api.research.searchFiles, { q })
  const pathname = usePathname()
  const { openModal } = useWorkspaceModal()
  const basePath = pathname.startsWith('/research') ? '/research' : ''

  if (files === undefined) {
    return (
      <div className={s.panel}>
        <div className={s.header}>Searching...</div>
      </div>
    )
  }

  return (
    <div className={s.panel}>
      <header className={s.header}>
        <div className={s.breadcrumb}>SEARCH RESULTS: &quot;{q}&quot;</div>
      </header>

      {files.length === 0 ? (
        <div style={{ opacity: 0.5, fontFamily: 'monospace' }}>
          No results found for &quot;{q}&quot;
        </div>
      ) : (
        <div className={s.list}>
          <div
            className={s.file_list_item}
            style={{
              opacity: 0.5,
              borderTop: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <span>NAME</span>
            <span>TYPE</span>
            <span>PATH</span>
          </div>
          {files.map((file) => (
            <Link
              href={`${basePath}/file/${file._id}`}
              onClick={(e) => {
                e.preventDefault()
                openModal(file._id)
              }}
              key={file._id}
              className={s.file_list_item}
            >
              <span className={s.file_name}>{file.name}</span>
              <span className={s.file_meta}>{file.mime || 'unknown'}</span>
              <span className={s.file_meta}>
                {file.parent_folder || 'root'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className={s.panel}>
          <div className={s.header}>Loading search...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
