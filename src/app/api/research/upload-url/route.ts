import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_KEY!,
    secretAccessKey: process.env.R2_SECRET!
  }
})

export async function POST(req: Request) {
  const { path, mime } = await req.json()

  const command = new PutObjectCommand({
    Bucket: 'research',
    Key: path,
    ContentType: mime
  })

  const url = await getSignedUrl(client, command, { expiresIn: 60 })

  return Response.json({ url })
}
