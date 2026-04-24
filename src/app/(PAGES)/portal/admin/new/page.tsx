'use client'

import { useAction, useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { UploadButton } from '~/lib/utils/uploadthing'
import { generateId } from '~/lib/utils/browser'
import { api } from '../../../../../../convex/_generated/api'
import type { Id } from '../../../../../../convex/_generated/dataModel'
import styles from '../../portal.module.scss'

type QuestionnaireItem = {
  id: string
  text: string
  type: 'text' | 'long_text' | 'url' | 'image'
}

export default function NewClientPage() {
  const createProject = useMutation(api.projects.create)
  const updateProject = useMutation(api.projects.update)
  const sendInvite = useAction(api.actions.sendProjectInvite)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setUserId(localStorage.getItem('portal_user_id'))
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    accessCodeOverride: '', // Allow manual override
    email: '',
    price: '',
    contractUrl: '',
    driveFolderId: '',
    completedSteps: {
      serviceAgreement: false,
      intake: false,
      payment: false
    },
    paymentDetails: '',
    questionnaire: [] as QuestionnaireItem[]
  })

  const [status, setStatus] = useState('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const getPreviewAccessCode = () => {
    if (formData.accessCodeOverride) return formData.accessCodeOverride
    if (!formData.clientName) return 'SAR.[ClientName]-[UUID]'
    const safeName = formData.clientName.replace(/\s+/g, '')
    return `SAR.${safeName}-...`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setStatus('loading')

    try {
      // 1. Create the project
      const { projectId, accessCode } = await createProject({
        userId: userId as Id<'users'>,
        name: formData.name,
        clientName: formData.clientName,
        email: formData.email,
        price: formData.price,
        driveFolderId: formData.driveFolderId || 'placeholder_folder_id',
        completedSteps: formData.completedSteps,
        paymentDetails: formData.paymentDetails
      })

      // 2. Optionally update if they provided overrides/contract/questionnaire
      // We have to update because `create` doesn't accept questionnaire or contractUrl currently
      const updates: any = {}
      if (formData.questionnaire.length > 0)
        updates.questionnaire = formData.questionnaire
      if (formData.contractUrl) updates.contractUrl = formData.contractUrl

      if (Object.keys(updates).length > 0) {
        await updateProject({
          userId: userId as Id<'users'>,
          projectId,
          ...updates
        })
      }

      // 3. Send email invite
      await sendInvite({
        userId: userId as Id<'users'>,
        email: formData.email,
        projectName: formData.name,
        accessCode: accessCode
      })

      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.container}>
        <div className={styles.landingContainer}>
          <div className={styles.landingContent}>
            <h2 className={styles.landingTitle}>Success!</h2>
            <p className={styles.landingText}>
              Client created and invite sent to {formData.email}.
            </p>
            <button
              className={styles.landingButton}
              onClick={() => {
                window.location.href = '/admin'
              }}
              type="button"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.landingContainer}
        style={{
          display: 'block',
          padding: 'var(--space)',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <h1 className={styles.landingTitle}>New Client Project</h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gap: '2rem'
          }}
        >
          {/* ─── Basic Details ───────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              background: '#171717',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #262626'
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
              Basic Details
            </h2>

            <div>
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#a3a3a3'
                }}
              >
                Project Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#262626',
                  border: '1px solid #404040',
                  color: 'white',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}
            >
              <div>
                <label
                  htmlFor="clientName"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#a3a3a3'
                  }}
                >
                  Client Name
                </label>
                <input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Acme Corp"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#262626',
                    border: '1px solid #404040',
                    color: 'white',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#a3a3a3'
                  }}
                >
                  Access Code Preview
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#0a0a0a',
                    border: '1px dashed #404040',
                    color: '#a3a3a3',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace'
                  }}
                >
                  {getPreviewAccessCode()}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#a3a3a3'
                }}
              >
                Client Email (for invite)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#262626',
                  border: '1px solid #404040',
                  color: 'white',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}
            >
              <div>
                <label
                  htmlFor="price"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#a3a3a3'
                  }}
                >
                  Project Price
                </label>
                <input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="$10,000"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#262626',
                    border: '1px solid #404040',
                    color: 'white',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="driveFolderId"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#a3a3a3'
                  }}
                >
                  Drive Folder ID (Deliverables)
                </label>
                <input
                  id="driveFolderId"
                  name="driveFolderId"
                  value={formData.driveFolderId}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#262626',
                    border: '1px solid #404040',
                    color: 'white',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* ─── Onboarding Configuration ──────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              background: '#171717',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #262626'
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
              Onboarding Config
            </h2>

            <div>
              <p style={{ marginBottom: '0.5rem', color: '#a3a3a3' }}>
                Mark Already Completed Steps:
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  background: '#0a0a0a',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #262626'
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  <input
                    type="checkbox"
                    name="serviceAgreement"
                    checked={formData.completedSteps.serviceAgreement}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Service Agreement
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  <input
                    type="checkbox"
                    name="intake"
                    checked={formData.completedSteps.intake}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Intake Form
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  <input
                    type="checkbox"
                    name="payment"
                    checked={formData.completedSteps.payment}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Payment (50%)
                </label>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#a3a3a3'
                  }}
                >
                  Contract (PDF Upload)
                </label>
                {formData.contractUrl ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      background: '#0a0a0a',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      border: '1px solid #262626'
                    }}
                  >
                    <a
                      href={formData.contractUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#4ade80',
                        textDecoration: 'underline',
                        fontSize: '0.875rem',
                        flex: 1
                      }}
                    >
                      PDF Uploaded
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, contractUrl: '' })
                      }
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
                ) : (
                  <div
                    style={{
                      background: '#0a0a0a',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px dashed #404040'
                    }}
                  >
                    <UploadButton
                      endpoint="contractUploader"
                      onClientUploadComplete={(res) => {
                        if (res?.[0])
                          setFormData({ ...formData, contractUrl: res[0].url })
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="paymentDetails"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#a3a3a3'
                  }}
                >
                  Payment Instructions / Link
                </label>
                <textarea
                  id="paymentDetails"
                  name="paymentDetails"
                  value={formData.paymentDetails}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Stripe checkout link or bank details..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#262626',
                    border: '1px solid #404040',
                    color: 'white',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* ─── Questionnaire Builder ─────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              background: '#171717',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #262626'
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
              Intake Questionnaire Builder
            </h2>

            {formData.questionnaire.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                {formData.questionnaire.map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                      background: '#0a0a0a',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #262626'
                    }}
                  >
                    <span
                      style={{
                        color: '#737373',
                        fontSize: '0.8rem',
                        width: '20px'
                      }}
                    >
                      {idx + 1}.
                    </span>
                    <span style={{ flex: 1, fontSize: '0.875rem' }}>
                      {q.text}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        background: '#404040',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {q.type.replace('_', ' ')}
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
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0 0.5rem'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-end',
                background: '#0a0a0a',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px dashed #404040'
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="newQuestionText"
                  style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontSize: '0.75rem',
                    color: '#a3a3a3'
                  }}
                >
                  Question Text
                </label>
                <input
                  id="newQuestionText"
                  placeholder="e.g. What is your primary goal?"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#262626',
                    border: '1px solid #404040',
                    color: 'white',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div style={{ width: '150px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontSize: '0.75rem',
                    color: '#a3a3a3'
                  }}
                >
                  Response Type
                </label>
                <select
                  id="newQuestionType"
                  style={{
                    width: '100%',
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
              </div>
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
                    const newQ: QuestionnaireItem = {
                      id: generateId(),
                      text: textInput.value,
                      type: typeInput.value as any
                    }
                    setFormData({
                      ...formData,
                      questionnaire: [...formData.questionnaire, newQ]
                    })
                    textInput.value = ''
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--color-primary)',
                  color: 'var(--color-base)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Add
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'var(--color-primary)',
              color: 'var(--color-base)',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              border: 'none',
              borderRadius: '4px',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              opacity: status === 'loading' ? 0.7 : 1
            }}
          >
            {status === 'loading'
              ? 'Creating & Sending Invite...'
              : 'Create Client Project'}
          </button>

          {status === 'error' && (
            <p style={{ color: '#ef4444', textAlign: 'center' }}>
              Error creating client. Check console.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
