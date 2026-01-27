'use server'
import { GetServerSidePropsContext } from 'next'
import { cookies } from 'next/headers'

const password = process.env.PAGE_PASSWORD
const AUTH_COOKIE_NAME: string =
  process.env.PASSWORD_COOKIE_NAME || 'isAuthenticated'

export async function checkPassword(enteredPassword: string): Promise<boolean> {
  return enteredPassword === password
}

export async function authenticate(
  ctx: GetServerSidePropsContext
): Promise<boolean> {
  const authHeader = ctx.req.headers.authorization
  if (!authHeader) {
    return false
  }

  const encodedPassword = authHeader.split(' ')[1]
  if (!encodedPassword) {
    return false
  }
  const decodedPassword = Buffer.from(encodedPassword, 'base64').toString()

  return decodedPassword === password
}

export async function setAuthCookie() {
  const oneDay = 24 * 60 * 60 * 1000
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, 'true', { expires: Date.now() - oneDay })
}

export async function checkAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies()
  const isCookieValid = cookieStore.get(AUTH_COOKIE_NAME)?.value === 'true'
  return isCookieValid
}
