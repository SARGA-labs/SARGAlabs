import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  contractUploader: f({ pdf: { maxFileSize: '4MB' } })
    .middleware(async () => {
      // TODO: Add real auth (e.g. validate session cookie/token)
      const user = { id: 'admin' }
      if (!user) throw new Error('Unauthorized')
      return { userId: user.id }
    })
    .onUploadComplete(
      async ({
        metadata,
        file
      }: {
        metadata: { userId: string }
        file: { ufsUrl: string }
      }) => {
        console.log('Contract upload complete for userId:', metadata.userId)
        console.log('file url', file.ufsUrl)
        return { uploadedBy: metadata.userId }
      }
    ),

  paymentProofUploader: f({
    image: { maxFileSize: '4MB' },
    pdf: { maxFileSize: '4MB' }
  })
    .middleware(async () => {
      // TODO: Add real auth (e.g. validate session cookie/token)
      const user = { id: 'client' }
      if (!user) throw new Error('Unauthorized')
      return { userId: user.id }
    })
    .onUploadComplete(
      async ({
        metadata,
        file
      }: {
        metadata: { userId: string }
        file: { ufsUrl: string }
      }) => {
        console.log(
          'Payment proof upload complete for userId:',
          metadata.userId
        )
        console.log('file url', file.ufsUrl)
        return { uploadedBy: metadata.userId, url: file.ufsUrl }
      }
    ),

  moodboardMediaUploader: f({
    image: { maxFileSize: '16MB', maxFileCount: 30 },
    audio: { maxFileSize: '16MB', maxFileCount: 10 }
  })
    .middleware(async () => {
      // TODO: Add real auth (e.g. validate session cookie/token)
      const user = { id: 'admin' }
      if (!user) throw new Error('Unauthorized')
      return { userId: user.id }
    })
    .onUploadComplete(
      async ({
        metadata,
        file
      }: {
        metadata: { userId: string }
        file: { ufsUrl: string }
      }) => {
        console.log(
          'Moodboard media upload complete for userId:',
          metadata.userId
        )
        console.log('file url', file.ufsUrl)
        return { uploadedBy: metadata.userId, url: file.ufsUrl }
      }
    )
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
