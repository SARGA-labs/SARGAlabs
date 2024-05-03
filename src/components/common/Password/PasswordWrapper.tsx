import { cookies } from 'next/headers'
import React from 'react'

import PasswordProtect from './passwordProtect'

export default function PasswordWrapper({
  children
}: {
  children?: React.ReactNode
}) {
  const cookiesStore = cookies()
  const loginCookies = cookiesStore.get(process.env.PASSWORD_COOKIE_NAME!)
  const isLoggedIn = !!loginCookies?.value
  return !isLoggedIn ? <PasswordProtect /> : children
}
