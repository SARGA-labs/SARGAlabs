'use client'
import Image from 'next/image'
import React from 'react'
import Masonry from 'react-masonry-css'

import image from '~/public/dnd/1.png'
import image2 from '~/public/dnd/2.jpg'
import image3 from '~/public/dnd/3.jpg'

import { Container } from '../container'

const breakpointColumns = {
  default: 6,
  1100: 3,
  700: 2,
  500: 1
}

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
        <p>03rd August 2024, ASH DAY THE BEST DAY EVER.</p>
        <p>10th August 2024, SHE GIVES ME PURPOSE</p>
        <p>
          13th August 2024, Registred SARGA(lifestyle), the progress is unreal.
          ITS ALL FOR HER.
        </p>
        <p>
          16th August 2024, SUBCULTURE BLOCK PARTY, I'm glad other peeps didnt
          pull up the best time I ever spent.
        </p>
        <p>21st August 2024, LOVING IS A GREAT FEELING.</p>
        <p>21st August 2024, EVERYTHING I DO IS FOR HER.</p>
        <p>
          22rd August 2024, MARTY is getting on the packaging as a barter for
          some help I'm doing for him. He has great creative direction. HE IS
          GONNA DO EVERYTHING FOR SARGA(LIFESTYLE)
        </p>
        <p>
          24th August 2024, She is skeptical about the whole thing and I wanna
          make her believe in me and trust me.
        </p>
        <p>
          06th September 2024, NEW DOMAIN, www.sar.ga, all the subdomains are
          gonna look soo good + the emails are gonna look so good.
        </p>
        <Image src={image2} alt="two" />
        <p>
          07th September 2024, ANAVRIN IS LIVEEEEEE, I can't wait for both of
          them to succeed, I hope I can be along the way of their success with
          SARGA.
        </p>
        <p>
          10th, September 2024, ANAVRIN is going at great speed, also got start
          working on MAATI with Sohana.
        </p>
        <p>
          10th, September 2024, I wish I could join her on the Concert, but I
          hope she enjoys a ton, We got COLDPLAY coming tho.
        </p>
        <Image src={image3} alt="three" />
        <p>
          14th Sept,Its tough in situations like this listening to stuff like
          this all I can do is hear her out I just hope we can having flowing
          conversations again, I can be a man to her, for her to not think just
          open her mind up to me stay as comfortable as she wants to be. be. ALL
          LOVE FOR HER.
        </p>
        <p>
          17th Sept, I&apos;m dedicated, I mean it when I say it. I know I
          couldn&apos;t live up to the things that I have said but one thing
          that is engraved in me is I&apos;m dedicated. EVERYTHING I DO IS FOR
          LOVE. I don&apos;t want the love in return lemme just play my part
          atleast.
        </p>
        <p>
          21th Sept, BRUH NGL LOVE YOURSELF ONLY THEN YOU CAN EXPECT LOVE FROM
          SOMEONE. I LOVE MYSELF. THANKS ASH.
        </p>
        <p>21st Sept, Don&apos;t play to win or lose just play.</p>
        <p>
          1st Oct, Probably the worst and the best day of my life, I dont fuck
          around, learned alot and going into isolation. Winter arc has began.
          Heard it for the first time “I LIKED YOU” felt nice everything I
          wanted to hear ever. &lt; 3 ALL LOVE FOR YOU ASH AND TOM AND JERRY; I
          don&apos;t need anything at all now. Thanks for everything and
          everyone. Sorry.
        </p>
        <p>
          10th Oct, Launch day for Anvarin, I&apos;m glad I&apos;m able to help
          her out. But a end of our journey.
        </p>
      </Masonry>
    </>
  )
}