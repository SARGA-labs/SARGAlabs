import React, { ReactNode } from 'react'
import styles from './errors.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ReactNode
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState<boolean>(false)
  const [error, setError] = React.useState<unknown>(null)

  if (hasError) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Error'
    const displayError = `An unexpected error occurred: ${errorMessage}`

    if (fallback) {
      return (
        <div className={styles.errorBoundaryWrapper}>
          {fallback}
        </div>
      )
    }

    return (
      <div className={styles.errorBoundaryWrapper}>
        <h2 className={styles.errorTitle}>⚠️ Component Error</h2>
        <p>{displayError}</p>
        <button onClick={() => {
          setHasError(false)
          setError(null)
        }}>Try Again</button>
      </div>
    )
  }

  return <>{children}</>
}

export default ErrorBoundary
