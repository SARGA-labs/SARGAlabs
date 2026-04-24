'use client'

import { useQuery } from 'convex/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import styles from './portal.module.scss'

function isPublicMoodboardPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length !== 2) return false
  const first = parts[0]
  return first !== 'admin' && first !== 'auth'
}

export default function PortalLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [storedUserId, setStoredUserId] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    setStoredUserId(localStorage.getItem('portal_user_id'))
  }, [])

  useEffect(() => {
    if (!isClient) return
    setStoredUserId(localStorage.getItem('portal_user_id'))
  }, [isClient, pathname])

  const currentUser = useQuery(
    api.users.get,
    storedUserId
      ? {
          id: storedUserId as Id<'users'>,
          userId: storedUserId as Id<'users'>
        }
      : 'skip'
  )

  const isLoginPage = pathname === '/auth'
  const isAdminRoute = pathname.startsWith('/admin')
  const isPublicMoodboard = isPublicMoodboardPath(pathname)

  useEffect(() => {
    if (!isClient) return

    const latestUserId = localStorage.getItem('portal_user_id')
    if (latestUserId && latestUserId !== storedUserId) {
      setStoredUserId(latestUserId)
      return
    }

    if (!latestUserId && !isLoginPage && !isPublicMoodboard) {
      router.replace('/auth')
      return
    }

    if (isAdminRoute && latestUserId) {
      if (currentUser === undefined) return
      if (!currentUser || currentUser.role !== 'admin') {
        localStorage.removeItem('portal_user_id')
        localStorage.removeItem('portal_project_id')
        localStorage.removeItem('portal_slug')
        setStoredUserId(null)
        router.replace('/auth')
      }
    }
  }, [
    isClient,
    storedUserId,
    isLoginPage,
    isAdminRoute,
    isPublicMoodboard,
    currentUser,
    router
  ])

  if (!isClient) return null

  if (!storedUserId && !isLoginPage && !isPublicMoodboard) {
    return null
  }

  if (isAdminRoute && storedUserId && currentUser === undefined) {
    return null
  }

  if (isAdminRoute && storedUserId && currentUser && currentUser.role !== 'admin') {
    return null
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
