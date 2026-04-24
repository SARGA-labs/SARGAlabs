'use client'

import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { UploadButton } from '~/lib/utils/uploadthing'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import styles from './onboarding-view.module.scss'

export default function OnboardingView({ project }: { project: any }) {
  const submitVerification = useMutation(api.projects.submitVerification)
  const updateProject = useMutation(api.projects.update)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submittingQ, setSubmittingQ] = useState(false)
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(
    project.paymentProofUrl ?? null
  )
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setUserId(localStorage.getItem('portal_user_id'))
  }, [])

  useEffect(() => {
    if (project.questionnaireAnswers) {
      setAnswers(project.questionnaireAnswers)
    }
  }, [project.questionnaireAnswers])

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const submitQuestionnaire = async () => {
    if (!userId) return
    setSubmittingQ(true)
    try {
      await updateProject({
        userId: userId as Id<'users'>,
        projectId: project._id,
        questionnaireAnswers: answers
      })
    } catch (error) {
      console.error('Failed to submit questionnaire', error)
    } finally {
      setSubmittingQ(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{project.name}</h1>
        <p className={styles.description}>ONBOARDING INITIALIZATION</p>
      </header>

      <div className={styles.card}>
        <div className={styles.steps}>
          {[
            {
              key: 'serviceAgreement',
              label: 'REVIEW SERVICE AGREEMENT',
              content: project.contractUrl ? (
                <a
                  href={project.contractUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.link}
                >
                  VIEW CONTRACT PDF &rarr;
                </a>
              ) : (
                <p className={styles.monoText}>
                  [ CONTRACT PENDING ADMIN UPLOAD ]
                </p>
              )
            },
            {
              key: 'intake',
              label: 'INTAKE QUESTIONNAIRE',
              content: (
                <div>
                  {project.questionnaire && project.questionnaire.length > 0 ? (
                    <div className={styles.qContainer}>
                      {project.questionnaireAnswers ? (
                        <p className={styles.successText}>
                          [ QUESTIONNAIRE SUBMITTED ]
                        </p>
                      ) : (
                        <>
                          {project.questionnaire.map((q: any) => (
                            <div key={q.id} className={styles.qItem}>
                              <p className={styles.qLabel}>{q.text}</p>
                              {q.type === 'long_text' ? (
                                <textarea
                                  value={answers[q.id] || ''}
                                  onChange={(e) =>
                                    handleAnswerChange(q.id, e.target.value)
                                  }
                                  className={styles.qTextarea}
                                  placeholder="Type response..."
                                />
                              ) : q.type === 'image' ? (
                                <div
                                  style={{
                                    padding: '0.5rem',
                                    border: '1px dashed var(--color-primary)'
                                  }}
                                >
                                  {answers[q.id] ? (
                                    <img
                                      src={answers[q.id]}
                                      alt="Uploaded"
                                      style={{ maxWidth: '200px' }}
                                    />
                                  ) : (
                                    <UploadButton
                                      endpoint="paymentProofUploader"
                                      onClientUploadComplete={(res) => {
                                        if (res?.[0])
                                          handleAnswerChange(q.id, res[0].url)
                                      }}
                                    />
                                  )}
                                </div>
                              ) : (
                                <input
                                  type={q.type === 'url' ? 'url' : 'text'}
                                  value={answers[q.id] || ''}
                                  onChange={(e) =>
                                    handleAnswerChange(q.id, e.target.value)
                                  }
                                  className={styles.qInput}
                                  placeholder={
                                    q.type === 'url'
                                      ? 'https://...'
                                      : 'Type response...'
                                  }
                                />
                              )}
                            </div>
                          ))}
                          <button
                            disabled={submittingQ}
                            onClick={submitQuestionnaire}
                            className={styles.button}
                            style={{ marginTop: '1rem', maxWidth: '200px' }}
                            type="button"
                          >
                            {submittingQ ? 'SUBMITTING...' : 'SUBMIT ANSWERS'}
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className={styles.monoText}>[ QUESTIONNAIRE PENDING ]</p>
                  )}
                </div>
              )
            },
            {
              key: 'payment',
              label: 'PAYMENT (50% UPFRONT)',
              content: (
                <p
                  style={{
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5
                  }}
                >
                  {project.paymentDetails ||
                    '[ NO PAYMENT INSTRUCTIONS PROVIDED ]'}
                </p>
              )
            },
            {
              key: 'proofOfPayment',
              label: 'UPLOAD PROOF OF PAYMENT',
              content: (
                <div>
                  {uploadedProofUrl ? (
                    <a
                      href={uploadedProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.successText}
                      style={{ textDecoration: 'underline' }}
                    >
                      [ VIEW UPLOADED PROOF &rarr; ]
                    </a>
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        border: '1px dashed var(--color-primary)'
                      }}
                    >
                      <UploadButton
                        endpoint="paymentProofUploader"
                        onClientUploadComplete={async (res) => {
                          if (res?.[0] && userId) {
                            const url = res[0].url
                            setUploadedProofUrl(url)
                            try {
                              await updateProject({
                                userId: userId as Id<'users'>,
                                projectId: project._id,
                                paymentProofUrl: url
                              })
                            } catch (err) {
                              console.error('Failed to save proof URL', err)
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            }
          ]
            .filter((step) => {
              if (step.key === 'proofOfPayment')
                return !project.completedSteps?.payment
              return !project.completedSteps?.[
                step.key as keyof typeof project.completedSteps
              ]
            })
            .map((step, index) => (
              <div key={step.key} className={styles.step}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepNumberActive}>0{index + 1}</span>
                  <span className={styles.stepTextActive}>{step.label}</span>
                </div>
                {step.content && (
                  <div className={styles.stepContent}>{step.content}</div>
                )}
              </div>
            ))}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.button}
            type="button"
            onClick={async () => {
              if (!userId) return
              try {
                await submitVerification({
                  userId: userId as Id<'users'>,
                  projectId: project._id
                })
                window.location.reload()
              } catch (err) {
                console.error('Failed to verify', err)
              }
            }}
          >
            SUBMIT FOR VERIFICATION
          </button>
        </div>
      </div>
    </div>
  )
}
