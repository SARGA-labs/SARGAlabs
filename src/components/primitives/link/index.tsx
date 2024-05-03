'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
export default function Link({
  href,
  children,
  activeClassName = 'active',
  ...props
}: {
  href: string
  children: React.ReactNode
  activeClassName?: string | undefined
}) {
  const c = usePathname()
  return (
    <NextLink
      href={href}
      className={c === `${href}` ? activeClassName : undefined}
      {...props}
    >
      {children}
    </NextLink>
  )
}
