import { cookies } from 'next/headers'
import { ReactNode } from 'react'

import PasswordProtect from './passwordProtect'

export default async function PasswordWrapper({
  children
}: {
  children?: ReactNode
}) {
  const cookiesStore = await cookies()
  const loginCookies = cookiesStore.get(process.env.PASSWORD_COOKIE_NAME!)
  const isLoggedIn = !!loginCookies?.value
  return !isLoggedIn ? <PasswordProtect /> : children
}
