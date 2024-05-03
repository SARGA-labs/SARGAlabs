'use client'

import React from 'react'

import { Container } from '~/components/container'
import { getTodaysDate } from '~/lib/utils/date'

import f from './css/_footer.module.scss'

export default function Footer() {
  const year = new Date().getFullYear()
  const date = getTodaysDate()
  return (
    <Container className={f['footer']}>
      <p>{year}</p>
      <p dangerouslySetInnerHTML={{ __html: date }} />
    </Container>
  )
}
