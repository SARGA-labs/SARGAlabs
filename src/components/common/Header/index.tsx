import React from 'react'

import { Container } from '~/components/container'
import Link from '~/components/primitives/link'

import Logo from '../logo'
import h from './css/header.module.scss'

export default function Header() {
  return (
    <Container className={h['navigation']}>
      <Logo className={h['brand']} />
      <ul className={h['links']}>
        <li>
          <Link href={'/'} activeClassName={h.active}>
            WORK(3)
          </Link>
        </li>
        <li>
          <Link href={'/STUDIO'} activeClassName={h.active}>
            STUDIO
          </Link>
        </li>
        <li>
          <Link href={'/DND'} activeClassName={h.active}>
            DIYUKSH BY DIYUKSH (0001)
          </Link>
        </li>
      </ul>
    </Container>
  )
}
