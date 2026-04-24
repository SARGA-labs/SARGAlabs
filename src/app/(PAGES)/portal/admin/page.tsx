'use client'

import { useQuery } from 'convex/react'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import styles from '../portal.module.scss'

type Project = {
  _id: string
  name: string
  email: string
  status: 'Onboarding' | 'Active' | 'Completed' | 'Archived' | string
  slug: string
}

function getStatusClass(status: string) {
  if (status === 'Active') return styles.statusBadgeActive
  if (status === 'Onboarding') return styles.statusBadgeOnboarding
  if (status === 'Completed') return styles.statusBadgeCompleted
  if (status === 'Archived') return styles.statusBadgeArchived
  return styles.statusBadgeDefault
}

export default function AdminDashboard() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setUserId(localStorage.getItem('portal_user_id'))
  }, [])

  const projects = useQuery(
    api.projects.list,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  ) as Project[] | undefined

  const stats = useMemo(() => {
    const list = projects || []
    return {
      total: list.length,
      active: list.filter((p) => p.status === 'Active').length,
      onboarding: list.filter((p) => p.status === 'Onboarding').length,
      completed: list.filter((p) => p.status === 'Completed').length
    }
  }, [projects])

  return (
    <div className={styles.container}>
      <div className={styles.adminShell}>
        <header className={styles.adminHeader}>
          <div>
            <p className={styles.adminEyebrow}>PORTAL ADMIN</p>
            <h1 className={styles.landingTitle}>Admin Dashboard</h1>
            <p className={styles.landingText}>Manage projects, onboarding, and client access.</p>
          </div>
          <Link href="/admin/new" className={styles.adminCta}>
            + New Client
          </Link>
        </header>

        <section className={styles.adminStatsGrid}>
          <div className={styles.adminStatCard}>
            <p className={styles.adminStatLabel}>Total Projects</p>
            <p className={styles.adminStatValue}>{stats.total}</p>
          </div>
          <div className={styles.adminStatCard}>
            <p className={styles.adminStatLabel}>Active</p>
            <p className={styles.adminStatValue}>{stats.active}</p>
          </div>
          <div className={styles.adminStatCard}>
            <p className={styles.adminStatLabel}>Onboarding</p>
            <p className={styles.adminStatValue}>{stats.onboarding}</p>
          </div>
          <div className={styles.adminStatCard}>
            <p className={styles.adminStatLabel}>Completed</p>
            <p className={styles.adminStatValue}>{stats.completed}</p>
          </div>
        </section>

        <section className={styles.adminProjectsSection}>
          <div className={styles.adminProjectsHeader}>
            <h2 className={styles.adminSectionTitle}>Projects</h2>
            {projects && <span className={styles.adminProjectsCount}>{projects.length} total</span>}
          </div>

          {projects === undefined ? (
            <p className={styles.landingText}>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className={styles.landingText}>No projects found.</p>
          ) : (
            <div className={styles.adminProjectsList}>
              {projects.map((project) => (
                <article key={project._id} className={styles.adminProjectCard}>
                  <div className={styles.adminProjectMain}>
                    <div className={styles.adminProjectTopRow}>
                      <h3 className={styles.adminProjectTitle}>{project.name}</h3>
                      <span className={`${styles.adminStatusBadge} ${getStatusClass(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className={styles.adminProjectMeta}>{project.email}</p>
                    <p className={styles.adminProjectSlug}>/{project.slug}</p>
                  </div>

                  <div className={styles.adminActions}>
                    <Link href={`/admin/edit/${project._id}`} className={styles.adminSecondaryAction}>
                      Edit
                    </Link>
                    <Link href={`/${project.slug}`} className={styles.adminPrimaryAction}>
                      View Dashboard
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
