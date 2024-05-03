'use server'

import { cookies } from 'next/headers'

export async function POST(request: Request, _params: { slug: string }) {
  if (!process.env.PASSWORD_COOKIE_NAME) {
    throw new Error(
      'PASSWORD_COOKIE_NAME is not defined in environment variables'
    )
  }

  let data: { password: string }
  try {
    data = await request.json()
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return new Response('Bad request', { status: 400 })
  }

  const password = data.password

  if (process.env.PAGE_PASSWORD !== password) {
    return new Response('incorrect password', {
      status: 401
    })
  }

  return new Response('password correct', {
    status: 200,
    headers: {
      'set-Cookie': String(
        cookies().set(process.env.PASSWORD_COOKIE_NAME, 'true')
      )
    }
  })
}
