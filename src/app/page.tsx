import React from 'react'

import { Container } from '~/components/container'
import ProjectCard from '~/components/layout/ProjectCard'

const HomePage = () => {
  return (
    <>
      <Container className="HOME-PAGE">
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
      </Container>
    </>
  )
}

export default HomePage
