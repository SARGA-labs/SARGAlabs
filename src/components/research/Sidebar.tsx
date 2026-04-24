/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
'use client'

import { useQuery } from 'convex/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import s from './sidebar.module.scss'
import { useWorkspaceModal } from './WorkspaceModalContext'

type FileNode = {
  _id: Id<'research_files'>
  name: string
  path: string
  mime?: string
}

type TreeNode = {
  name: string
  path: string
  children: Record<string, TreeNode>
  files: FileNode[]
}

const buildFileTree = (files: FileNode[]): TreeNode => {
  const root: TreeNode = { name: 'Root', path: '', children: {}, files: [] }

  files.forEach((file) => {
    const parts = file.path.split('/')
    if (parts.length === 1) {
      root.files.push(file)
      return
    }

    let current = root
    let currentPath = ''
    parts.pop() // Remove file name for folder path loop

    parts.forEach((part) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: currentPath,
          children: {},
          files: []
        }
      }
      current = current.children[part]!
    })

    current.files.push(file)
  })

  return root
}

const TreeView = ({
  node,
  level = 0,
  isRoot = false
}: {
  node: TreeNode
  level?: number
  isRoot?: boolean
}) => {
  const pathname = usePathname()
  const basePath = pathname.startsWith('/research') ? '/research' : ''
  const { openModal } = useWorkspaceModal()

  const [isOpen, setIsOpen] = useState(isRoot || level < 2) // Auto expand top levels

  const childFolders = Object.values(node.children).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  const files = [...node.files].sort((a, b) => a.name.localeCompare(b.name))

  if (childFolders.length === 0 && files.length === 0) return null

  const href = `${basePath}/${node.path}`
  const isActive = pathname === href && node.path !== ''

  return (
    <div className={level > 0 ? s.sub_tree : s.tree}>
      {!isRoot && (
        <button
          type="button"
          className={`${s.item} ${isActive ? s.active : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontFamily: 'inherit',
            textAlign: 'left',
            width: '100%',
            padding: 0
          }}
        >
          <div className={s.item_content}>
            <span className={s.icon}>{isOpen ? '▾' : '▸'}</span>
            <span style={{ fontWeight: 'bold' }}>{node.name}</span>
          </div>
        </button>
      )}

      {(isOpen || isRoot) && (
        <div
          className={isRoot ? '' : s.sub_tree_content}
          style={
            isRoot
              ? {}
              : {
                  paddingLeft: '15px',
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                  marginLeft: '5px',
                  display: 'flex',
                  flexDirection: 'column'
                }
          }
        >
          {childFolders.map((child) => (
            <TreeView key={child.path} node={child} level={level + 1} />
          ))}
          {files.map((file) => {
            const fileHref = `${basePath}/file/${file._id}`
            const isFileActive = pathname === fileHref
            return (
              <Link
                key={file._id}
                href={fileHref}
                onClick={(e) => {
                  e.preventDefault()
                  openModal(file._id)
                }}
                className={`${s.item} ${isFileActive ? s.active : ''}`}
                style={{ paddingLeft: '10px', opacity: 0.8 }}
              >
                <div className={s.item_content}>
                  <span className={s.icon} style={{ fontSize: '0.8em' }}>
                    📄
                  </span>
                  <span>{file.name}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const Sidebar = () => {
  const files = useQuery(api.research.listAllFiles)

  const tree = useMemo(() => {
    if (!files) return null
    return buildFileTree(files)
  }, [files])

  const pathname = usePathname()
  const basePath = pathname.startsWith('/research') ? '/research' : ''

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      window.location.href = `${basePath}/search?q=${encodeURIComponent(e.currentTarget.value)}`
    }
  }

  return (
    <div className={s.sidebar_content}>
      <Link
        href={basePath || '/'}
        className={s.title}
        style={{ display: 'block' }}
      >
        SARGA RESEARCH
      </Link>

      <input
        type="search"
        placeholder="Search files..."
        onKeyDown={handleSearch}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'var(--color-primary)',
          padding: '6pt',
          marginBottom: '10pt',
          width: '100%'
        }}
      />

      {tree ? (
        <TreeView node={tree} isRoot={true} />
      ) : (
        <div style={{ opacity: 0.5 }}>Syncing index...</div>
      )}
    </div>
  )
}
