import React from 'react'
import {
  generateUploadButton,
  generateUploadDropzone
} from '@uploadthing/react'
import type { OurFileRouter } from '~/app/api/uploadthing/core'

export const BaseUploadButton = generateUploadButton<OurFileRouter>()
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()

export function UploadButton(
  props: React.ComponentProps<typeof BaseUploadButton>
) {
  return (
    <BaseUploadButton
      {...props}
      appearance={{
        button: {
          background: 'transparent',
          border: '1px solid var(--color-primary, #fff)',
          color: 'var(--color-primary, #fff)',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          padding: '7px 16px',
          cursor: 'pointer',
          height: '32px',
          lineHeight: '1'
        },
        container: {
          display: 'flex',
          alignItems: 'center',
          gap: '0'
        },
        allowedContent: {
          display: 'none'
        },
        ...props.appearance
      }}
      content={{
        button: props.content?.button || 'UPLOAD',
        allowedContent: () => '',
        ...props.content
      }}
    />
  )
}
