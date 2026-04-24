'use client'

import { useMutation, useQuery } from 'convex/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UploadButton } from '~/lib/utils/uploadthing'
import { generateId } from '~/lib/utils/browser'
import { api } from '../../../../../../../convex/_generated/api'
import type { Id } from '../../../../../../../convex/_generated/dataModel'
import styles from '../../../portal.module.scss'
import { ActionPopover } from '~/components/ui/action-popover'

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.projectId as Id<'projects'>
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setUserId(localStorage.getItem('portal_user_id'))
  }, [])

  const project = useQuery(
    api.projects.get,
    userId ? { projectId, userId: userId as Id<'users'> } : 'skip'
  )
  const updateProject = useMutation(api.projects.update)
  const addTimelineItem = useMutation(api.projects.addTimelineItem)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    price: '',
    status: '',
    completedSteps: {
      serviceAgreement: false,
      intake: false,
      payment: false
    },
    contractUrl: '',
    paymentDetails: '',
    questionnaire: [] as { id: string; text: string; type: string }[]
  })

  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        email: project.email,
        price: project.price,
        status: project.status,
        completedSteps: project.completedSteps || {
          serviceAgreement: false,
          intake: false,
          payment: false
        },
        contractUrl: project.contractUrl ?? '',
        paymentDetails: project.paymentDetails ?? '',
        questionnaire: project.questionnaire ?? []
      })
    }
  }, [project])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      completedSteps: {
        ...formData.completedSteps,
        [e.target.name]: e.target.checked
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setStatus('loading')
    try {
      await updateProject({
        userId: userId as Id<'users'>,
        projectId,
        name: formData.name,
        email: formData.email,
        price: formData.price,
        status: formData.status,
        completedSteps: formData.completedSteps,
        contractUrl: formData.contractUrl,
        paymentDetails: formData.paymentDetails,
        questionnaire: formData.questionnaire
      })
      setStatus('success')
      setTimeout(() => {
        router.push('/admin')
      }, 1000)
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (!project) return <div className={styles.container}>Loading...</div>

  return (
    <div className={styles.container}>
      <div
        className={styles.landingContainer}
        style={{ display: 'block', padding: 'var(--space)' }}
      >
        <h1 className={styles.landingTitle}>Edit Project: {project.name}</h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gap: '1rem',
            maxWidth: '600px',
            margin: '2rem auto'
          }}
        >
          {/* Name */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#a3a3a3'
              }}
            >
              Project Name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  background: '#262626',
                  border: '1px solid #404040',
                  color: 'white',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#a3a3a3'
              }}
            >
              Email
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  background: '#262626',
                  border: '1px solid #404040',
                  color: 'white',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          {/* Status */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#a3a3a3'
              }}
            >
              Status
              <select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  background: '#262626',
                  border: '1px solid #404040',
                  color: 'white',
                  borderRadius: '4px'
                }}
              >
                <option value="Onboarding">Onboarding</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </label>
          </div>

          {/* Completed Steps */}
          <div style={{ marginTop: '1rem' }}>
            <p style={{ marginBottom: '0.5rem', color: '#a3a3a3' }}>
              Completed Steps:
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white'
                }}
              >
                <input
                  type="checkbox"
                  name="serviceAgreement"
                  checked={formData.completedSteps.serviceAgreement}
                  onChange={handleCheckboxChange}
                />
                Service Agreement
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white'
                }}
              >
                <input
                  type="checkbox"
                  name="intake"
                  checked={formData.completedSteps.intake}
                  onChange={handleCheckboxChange}
                />
                Intake
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white'
                }}
              >
                <input
                  type="checkbox"
                  name="payment"
                  checked={formData.completedSteps.payment}
                  onChange={handleCheckboxChange}
                />
                Payment
              </label>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <p style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Moodboards</p>
              <p style={{ color: '#737373', fontSize: '0.8rem' }}>
                Manage project moodboards for this client.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                router.push(`/admin/edit/moodboard/${projectId}`)
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
            >
              Manage Moodboards
            </button>
          </div>

          {/* Onboarding Details */}
          <div
            style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #333'
            }}
          >
            <p
              style={{
                color: '#a3a3a3',
                marginBottom: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              Onboarding Configuration
            </p>

            <div style={{ marginBottom: '1rem' }}>
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <> */}
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#a3a3a3'
                }}
              >
                Contract (PDF)
              </label>
              {formData.contractUrl ? (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                  <a
                    href={formData.contractUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#4ade80', textDecoration: 'underline' }}
                  >
                    View Current Contract
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, contractUrl: '' })
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'red',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <UploadButton
                  endpoint="contractUploader"
                  onClientUploadComplete={(res) => {
                    console.log('Files: ', res)
                    if (res?.[0]) {
                      setFormData({ ...formData, contractUrl: res[0].url })
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error(`Upload error: ${error.message}`)
                  }}
                />
              )}
            </div>

            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#a3a3a3'
              }}
            >
              Payment Details / Link
              <textarea
                name="paymentDetails"
                value={formData.paymentDetails}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, paymentDetails: e.target.value })
                }
                placeholder="Stripe link or Bank details..."
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  background: '#262626',
                  border: '1px solid #404040',
                  color: 'white',
                  borderRadius: '4px',
                  minHeight: '80px'
                }}
              />
            </label>
          </div>

          {/* Internal Questionnaire Builder */}
          <div
            style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #333'
            }}
          >
            <p
              style={{
                color: '#a3a3a3',
                marginBottom: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              Internal Questionnaire Builder
            </p>

            <div
              style={{ marginBottom: '1rem', display: 'grid', gap: '0.5rem' }}
            >
              {formData.questionnaire.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    background: '#262626',
                    padding: '0.5rem',
                    borderRadius: '4px'
                  }}
                >
                  <span
                    style={{ color: '#888', fontSize: '0.8rem', width: '20px' }}
                  >
                    {idx + 1}.
                  </span>
                  <span style={{ flex: 1, fontWeight: 'bold' }}>{q.text}</span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      background: '#404040',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px'
                    }}
                  >
                    {q.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newQ = formData.questionnaire.filter(
                        (item) => item.id !== q.id
                      )
                      setFormData({ ...formData, questionnaire: newQ })
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'red',
                      cursor: 'pointer'
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="newQuestionText"
                placeholder="New Question text"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: '#262626',
                  border: '1px solid #404040',
                  color: 'white',
                  borderRadius: '4px'
                }}
              />
              <select
                id="newQuestionType"
                style={{
                  padding: '0.5rem',
                  background: '#262626',
                  border: '1px solid #404040',
                  color: 'white',
                  borderRadius: '4px'
                }}
              >
                <option value="text">Short Text</option>
                <option value="long_text">Long Text</option>
                <option value="url">URL Link</option>
                <option value="image">Image Upload</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const textInput = document.getElementById(
                    'newQuestionText'
                  ) as HTMLInputElement
                  const typeInput = document.getElementById(
                    'newQuestionType'
                  ) as HTMLSelectElement
                  if (textInput.value) {
                    const newQ = {
                      id: generateId(),
                      text: textInput.value,
                      type: typeInput.value
                    }
                    setFormData({
                      ...formData,
                      questionnaire: [...formData.questionnaire, newQ]
                    })
                    textInput.value = ''
                  }
                }}
                style={{
                  padding: '0.5rem',
                  background: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              borderTop: '1px solid #404040',
              paddingTop: '1rem'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Timeline Management
            </h2>

            {/* Add New Item */}
            <div
              style={{
                background: '#1a1a1a',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}
            >
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                Add Milestone
              </h3>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <input
                  placeholder="Title (e.g. Design Phase)"
                  id="timelineTitle"
                  style={{
                    padding: '0.5rem',
                    background: '#262626',
                    border: '1px solid #404040',
                    color: 'white',
                    borderRadius: '4px'
                  }}
                />
                <input
                  type="date"
                  id="timelineDate"
                  style={{
                    padding: '0.5rem',
                    background: '#262626',
                    border: '1px solid #404040',
                    color: 'white',
                    borderRadius: '4px'
                  }}
                />
                <textarea
                  placeholder="Description (Optional)"
                  id="timelineDesc"
                  style={{
                    padding: '0.5rem',
                    background: '#262626',
                    border: '1px solid #404040',
                    color: 'white',
                    borderRadius: '4px'
                  }}
                />
                <ActionPopover
                  triggerLabel="Add Milestone"
                  successMessage="Milestone added!"
                  errorMessage="Failed to add milestone"
                  action={async () => {
                    if (!userId) throw new Error('Not logged in')
                    const titleInput = document.getElementById(
                      'timelineTitle'
                    ) as HTMLInputElement
                    const dateInput = document.getElementById(
                      'timelineDate'
                    ) as HTMLInputElement
                    const descInput = document.getElementById(
                      'timelineDesc'
                    ) as HTMLTextAreaElement

                    if (titleInput.value && dateInput.value) {
                      await addTimelineItem({
                        userId: userId as Id<'users'>,
                        projectId,
                        title: titleInput.value,
                        date: dateInput.value,
                        status: 'upcoming',
                        description: descInput.value
                      })
                      titleInput.value = ''
                      dateInput.value = ''
                      descInput.value = ''
                    } else {
                      throw new Error('Please fill title and date')
                    }
                  }}
                  style={{
                    padding: '0.5rem',
                    background: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* List Items */}
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {project.timeline?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#1a1a1a',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{item.title}</p>
                    <p style={{ fontSize: '0.8rem', color: '#888' }}>
                      {item.date} - {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'white',
              color: 'black',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer'
            }}
          >
            {status === 'loading' ? 'Saving...' : 'Save Changes'}
          </button>

          {status === 'success' && (
            <p style={{ color: 'green', marginTop: '0.5rem' }}>
              Saved successfully!
            </p>
          )}
          {status === 'error' && (
            <p style={{ color: 'red', marginTop: '0.5rem' }}>
              Error saving changes.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
