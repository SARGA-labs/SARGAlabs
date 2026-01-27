import Link from 'next/link'

import { Container } from '~/components/container'

import p from './css/_projectCard.module.scss'
export default function ProjectCard() {
  return (
    <Link href={'/'}>
      <Container className={p['project-card-container']}>
        <Container className={p['header']}>
          <p>01</p>
          <p>Project</p>
          <p>Year</p>
        </Container>
      </Container>
    </Link>
  )
}
