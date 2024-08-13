import Image from 'next/image'
import React from 'react'

import image from '~/public/dnd/1.png'

import { Container } from '../container'
export default function DNDComponent() {
  return (
    <Container className="DND-PAGE">
      <p>
        DIYUKSH BY DIYUKSH IS A ARCHIVE OF WORK FROM DIYUKSH UNDER THE BRAND
        NAME DIYUKSH A EXPIREMENT RAN AND MANAGED BY DIYUKSH TO DO THE
        NON-STEROTYPICAL MAKING THING NOT FOR SALE BUT FOR THE LOVE OF MAKING
        IT.
      </p>
      <Image src={image} alt="one" />
      <p>
        13th August 2024, Registred SARGA(lifestyle), the progress is unreal.
        ITS ALL FOR HER.
      </p>
      <p>SHE GIVES ME PURPOSE</p>
    </Container>
  )
}
