'use client'
import Image from 'next/image'
import Masonry from 'react-masonry-css'

import image from '~/public/dnd/1.png'
import image2 from '~/public/dnd/2.jpg'
import image3 from '~/public/dnd/3.jpg'

import { Container } from '../container'

export default function DNDComponent() {
  return (
    <>
      <Container
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <h1>JOURNAL</h1>
        <span>Last Updated: Wed 2 October, 2024 - 00:52</span>
      </Container>

      <Masonry
        className="DND-PAGE"
        breakpointCols={breakpointColumns}
        columnClassName="DND-COL"
      >
        <p>
          DIYUKSH BY DIYUKSH IS A ARCHIVE OF WORK FROM DIYUKSH UNDER THE BRAND
          NAME DIYUKSH A EXPIREMENT RAN AND MANAGED BY DIYUKSH TO DO THE
          NON-STEROTYPICAL MAKING THING NOT FOR SALE BUT FOR THE LOVE OF MAKING
          IT.
        </p>
        <Image src={image} alt="one" />
        <Image src={image2} alt="two" />
        <Image src={image3} alt="three" />
      </Masonry>
    </>
  )
}
