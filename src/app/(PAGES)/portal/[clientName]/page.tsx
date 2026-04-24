'use client'

import { useQuery } from 'convex/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

import OnboardingView from '../_components/OnboardingView'

import styles from './dashboard.module.scss'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  iconLink: string
  thumbnailLink: string
}

export default function ClientDashboard() {
  const params = useParams()
  const slug = params?.clientName as string
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setUserId(localStorage.getItem('portal_user_id'))
  }, [])

  const project = useQuery(
    api.projects.getBySlug,
    userId ? { slug: slug || '', userId: userId as Id<'users'> } : 'skip'
  ) as any

  const activities = useQuery(
    api.activities.get,
    project && userId
      ? { projectId: project._id, userId: userId as Id<'users'> }
      : 'skip'
  )

  const [files, setFiles] = useState<DriveFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  useEffect(() => {
    if (project?.driveFolderId) {
      setLoadingFiles(true)
      fetch(`/api/drive?folderId=${project.driveFolderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.files) setFiles(data.files)
        })
        .catch((err) => console.error('Failed to load drive files', err))
        .finally(() => setLoadingFiles(false))
    }
  }, [project])

  useEffect(() => {
    if (!userId) return
    if (project === undefined) return
    if (project === null) {
      router.replace('/auth')
    }
  }, [userId, project, router])

  if (!project)
    return <div className={styles.emptyState}>INITIALIZING WORKSPACE...</div>

  if (project.status === 'Onboarding') {
    return <OnboardingView project={project} />
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.projectName}>{project.name}</h1>
          <p className={styles.projectMeta}>
            Client Portal &bull; {project.status}
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainContent}>
          {/* Timeline */}
          <section>
            <h2 className={styles.sectionTitle}>Timeline</h2>
            <div className={styles.card}>
              {!project.timeline || project.timeline.length === 0 ? (
                <p className={styles.emptyState}>
                  [ NO TIMELINE MILESTONES DEFINED ]
                </p>
              ) : (
                <div className={styles.timelineContainer}>
                  {project.timeline.map(
                    (item: {
                      id: string
                      title: string
                      date: string
                      status: string
                      description?: string
                    }) => (
                      <div key={item.id} className={styles.timelineItem}>
                        <div
                          className={`${styles.timelineIcon} ${item.status === 'completed' ? styles.iconCompleted : ''}`}
                        >
                          {item.status === 'completed' ? '\u2713' : ''}
                        </div>
                        <div className={styles.timelineContent}>
                          <h3 className={styles.timelineTitle}>{item.title}</h3>
                          <p className={styles.timelineDate}>
                            {item.date} &bull; {item.status}
                          </p>
                          {item.description && (
                            <p className={styles.timelineDesc}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Deliverables */}
          <section>
            <h2 className={styles.sectionTitle}>Deliverables</h2>
            <div className={styles.cardNoPadding}>
              {loadingFiles ? (
                <div className={styles.emptyState}>
                  [ FETCHING FILES FROM DRIVE... ]
                </div>
              ) : files.length === 0 ? (
                <div className={styles.emptyState}>
                  [ NO DELIVERABLES UPLOADED YET ]
                </div>
              ) : (
                <ul className={styles.fileList}>
                  {files.map((file) => (
                    <li key={file.id} className={styles.fileItem}>
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.fileLink}
                      >
                        <div className={styles.fileIconWrapper}>
                          <div className={styles.fileIcon}>FILE</div>
                        </div>
                        <div className={styles.fileInfo}>
                          <p className={styles.fileName}>{file.name}</p>
                          <p className={styles.fileMeta}>GOOGLE DRIVE LINKED</p>
                        </div>
                        <div className={styles.arrowIcon}>&rarr;</div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <section className={styles.sidebarWrapper}>
            <h3 className={styles.sidebarTitle}>Project Details</h3>
            <dl className={styles.sidebarList}>
              <div>
                <dt className={styles.dt}>Status</dt>
                <dd className={styles.dd}>
                  <span className={styles.statusBadge}>{project.status}</span>
                </dd>
              </div>
            </dl>
          </section>

          <section className={styles.sidebarWrapper}>
            <h3 className={styles.sidebarTitle}>Activity Feed</h3>
            {activities ? (
              <ul className={styles.activityList}>
                {activities.length === 0 && (
                  <p className={styles.dt}>[ NO RECENT ACTIVITY ]</p>
                )}
                {activities.map((activity) => (
                  <li key={activity._id} className={styles.activityItem}>
                    <p className={styles.activityMessage}>{activity.message}</p>
                    <p className={styles.activityMeta}>
                      {new Date(activity.timestamp).toLocaleDateString()}{' '}
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.dt}>[ LOADING ACTIVITY... ]</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
