import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '~/components/container'
import { getSizes } from '~/lib/utils'
import about from '~/public/studio/about.webp'

export const metadata: Metadata = {
  title: 'STUDIO'
}

const STUDIOPAGE = () => {
  return (
    <Container as="section" className="STUDIO-PAGE">
      <Image
        className="image"
        src={about}
        alt="SARGA(labs) CEO | Diyuksh"
        sizes={getSizes([
          {
            breakpoint: '1500px',
            width: '1000px'
          },
          {
            breakpoint: '1000px',
            width: '700px'
          },
          {
            breakpoint: '800px',
            width: '600px'
          },
          {
            breakpoint: '600px',
            width: '500px'
          }
        ])}
      />
      <p className="info">
        SARGA(labs), a one-person creative studio by Diyuksh, works across
        visual arts, web development, and design. Diyuksh has been crafting
        unique experiences in various mediums for the past 7 years. Through
        SARGA(labs), Diyuk sh collaborates with thought-provoking artists and
        brands to develop distinct identities and build connections through
        impactful storytelling for the creation of cohesive and integrated brand
        experiences. Each project is approached as a collaborative journey,
        where identity design, art direction, and custom web development work
        together seamlessly. SARGA(labs) works closely with partners to support
        every stage of their growth. Diyuksh is drawn to concepts that feel both
        original and relatable, purposeful and intelligent. Inspiration comes
        from subtle details and intentional minimalism, with a focus on creating
        a tangible experience. SARGA(labs) seeks to transcend mere usability.
        COULD. /+ MUST./+ WILL.\^*
      </p>
      <Container className="solutions">
        <p>Solution(s)</p>
        <ul>
          <li>
            <p>DESIGN</p>
            <ol>
              <li>Brand Identity,</li>
              <li>Creative Direction,</li>
              <li>Print,</li>
              <li>Editorial,</li>
              <li>Packaging,</li>
              <li>Visual Communication, </li>
              <li>Design Prototyping,</li>
              <li>3D</li>
            </ol>
          </li>
          <li>
            <p>DIGITAL</p>
            <ol>
              <li>UI/UX, </li>
              <li>Web Design, </li>
              <li>Web Development,</li>
              <li>e-Commerce,</li>
              <li>Integration,</li>
              <li>Maintenance,</li>
              <li>Technical Consultation</li>
            </ol>
          </li>
          <li>
            <p>CONTENT</p>
            <ol>
              <li>Digital Brand Positioning, </li>
              <li>Content Architecture, </li>
              <li>Research</li>
            </ol>
          </li>

          <li>
            <p>PRODUCTION</p>
            <ol>
              <li>Music Production</li>
              <li>Video Editing</li>
              <li>Visualisation</li>
            </ol>
          </li>
        </ul>
      </Container>
      <Container className="socials">
        <ul className="sarga">
          <li>
            <Link href={'https://instagram.com/sargalabs'}>I. @SARGALABS</Link>
          </li>
          <li>
            <Link href={'https://x.com/sargalabs'}>X. @SARGALABS</Link>
          </li>
          <li>
            <Link href={'mailto:frontdesk@sargalabs.co'}>
              E. FRONTDESK@SARGALABS.CO
            </Link>
          </li>
        </ul>
        <ul className="diyuksh" id="diyuksh">
          <li>
            <Link href={'https://instagram.com/outdatedoutdatedoutdated'}>
              I. @OUTDATEDOUTDATEDOUTDATED
            </Link>
          </li>
          <li>
            <Link href={'https://x.com/00UTDATED'}>X. @00UTDATED</Link>
          </li>
          <li>
            <Link href={'https://sander.are.na/diyuksh-r'}>
              A<sup>.na</sup> @DIYUKSH-R
            </Link>
          </li>
        </ul>
        <ul className="credits">
          <li>Credits</li>
          <li>WEBSITE: DIYUKSH</li>
          <li>
            FONT:{' '}
            <Link href="https://lineto.com/typefaces/unica77" target="_blank">
              LINETO (UNICA77)
            </Link>
          </li>
        </ul>
      </Container>
    </Container>
  )
}

export default STUDIOPAGE
