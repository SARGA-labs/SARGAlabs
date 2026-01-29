import fs from 'fs'
import path from 'path'
import { Resend } from 'resend'
import matter from 'gray-matter'
import { render } from '@react-email/render'
import React from 'react'
import * as readline from 'readline'
import { NewsletterEmail } from '../src/emails/NewsletterEmail'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID
const CONTENT_DIR = path.join(process.cwd(), 'src/content/write')
const SITE_URL = 'https://sargalabs.com'

if (!RESEND_API_KEY) {
  console.error('Error: RESEND_API_KEY is missing in .env')
  process.exit(1)
}

const resend = new Resend(RESEND_API_KEY)

async function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close()
      resolve(ans)
    })
  )
}

async function main() {
  console.log('SARGA(labs) Newsletter Broadcaster')
  console.log('----------------------------------')

  // 1. Get latest post
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Error: Content directory not found at ${CONTENT_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => {
      const stat = fs.statSync(path.join(CONTENT_DIR, f))
      return { name: f, time: stat.mtime.getTime() }
    })
    .sort((a, b) => b.time - a.time)

  if (files.length === 0) {
    console.log('No posts found.')
    process.exit(0)
  }

  const latestFile = files[0]
  if (!latestFile) {
    process.exit(1)
  }

  const filePath = path.join(CONTENT_DIR, latestFile.name)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  
  const postUrl = `${SITE_URL}/write` 
  const title = data.title || latestFile.name.replace(/\.mdx$/, '')

  console.log(`Latest Post: ${latestFile.name}`)
  console.log(`Title:       ${title}`)
  console.log(`URL:         ${postUrl}`)
  console.log('----------------------------------')
  
  // 2. Confirm
  const answer = await askQuestion('Broadcast this post to all subscribers? (y/N): ')
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('Aborted.')
    process.exit(0)
  }

  // 3. Fetch Contacts
  console.log('Fetching contacts...')
  let contacts: any[] = []
  try {
    if (AUDIENCE_ID) {
        const result = await resend.contacts.list({ audienceId: AUDIENCE_ID })
        
        // Handling Resend's wrapper-style response
        if (result.data && 'data' in result.data) {
            contacts = (result.data as any).data
        } else if (Array.isArray(result.data)) {
            contacts = result.data
        } else if (result.error) {
            console.error('Resend API Error:', result.error)
            process.exit(1)
        }
    } else {
        console.warn('Warning: RESEND_AUDIENCE_ID not set in .env.')
        process.exit(1)
    }
  } catch (e) {
    console.error('Error fetching contacts:', e)
    process.exit(1)
  }

  if (!contacts || contacts.length === 0) {
    console.log('No contacts found in audience.')
    process.exit(0)
  }

  console.log(`Found ${contacts.length} contacts. Preparing to send...`)

  // 4. Render Email
  const emailHtml = await render(
    React.createElement(NewsletterEmail, {
      title: title as string,
      content: content,
      url: postUrl
    })
  )

  // 5. Send (Batching 50 at a time)
  const BATCH_SIZE = 50
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE)
    console.log(`Sending batch ${Math.floor(i / BATCH_SIZE) + 1}...`)
    
    const emailBatch = batch.map((contact: any) => ({
      from: 'SARGA(labs) <updates@noreply.sar.ga>',
      to: contact.email,
      subject: `New Post: ${title}`,
      html: emailHtml
    }))

    try {
      const { error } = await resend.batch.send(emailBatch)
      if (error) {
        console.error('Batch Send Error:', error)
      }
    } catch (e) {
      console.error('Exception during batch send:', e)
    }
  }

  console.log('Done.')
  process.exit(0)
}

main()
