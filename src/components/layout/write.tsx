'use client'

import { useEffect, useRef, useState } from 'react'
import Masonry from 'react-masonry-css'
import { Container } from '../container'
import s from './write.module.scss'
import { useWindowSize } from '~/hooks/use-window-size'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import Image from 'next/image'

const breakpointColumns = {
  default: 6,
  1100: 4,
  700: 2,
  500: 1
}

export const ShapeSpacer = ({
  side,
  radius
}: {
  side: 'left' | 'right'
  radius: number
}) => {
  const spacerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!spacerRef.current) return

      if (rafRef.current) return

      rafRef.current = requestAnimationFrame(() => {
        if (!spacerRef.current) return

        const rect = spacerRef.current.getBoundingClientRect()
        // Center of viewport relative to the spacer's top
        // y = (viewportHeight / 2) - spacerTopRelativeToViewport
        const viewportHeight = window.innerHeight
        const relativeY = viewportHeight / 2 - rect.top

        if (side === 'left') {
          spacerRef.current.style.shapeOutside = `circle(${radius}px at 100% ${relativeY}px)`
          spacerRef.current.style.width = `${radius}px`
        } else {
          spacerRef.current.style.shapeOutside = `circle(${radius}px at 0% ${relativeY}px)`
          spacerRef.current.style.width = `${radius}px`
        }

        rafRef.current = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [side, radius])

  return (
    <div
      ref={spacerRef}
      className={`${s.shapeSpacer || ''} ${side === 'left' ? s.floatRight || '' : s.floatLeft || ''}`}
      style={{ width: radius, height: '100%', minHeight: '300vh', zIndex: 10 }}
    />
  )
}

interface MdxItem {
  id: string | number
  frontmatter: any
  mdxSource: MDXRemoteSerializeResult
}

export default function WriteComponent({
  initialItems
}: {
  initialItems: MdxItem[]
}) {
  const [columns, setColumns] = useState(6)
  const { width } = useWindowSize()
  const [items, setItems] = useState<
    { uniqueId: string; data: MdxItem; originalIndex: number }[]
  >([])
  const [radius, setRadius] = useState(200)

  // Initialize items directly without chunking
  useEffect(() => {
    if (!initialItems || initialItems.length === 0) return

    const simpleItems = initialItems.map((item, i) => ({
      uniqueId: `${item.id}`,
      data: item,
      originalIndex: i + 1
    }))

    setItems(simpleItems)
  }, [initialItems])

  useEffect(() => {
    if (!width) return
    if (width <= 500) setColumns(1)
    else if (width <= 700) setColumns(2)
    else if (width <= 1100) setColumns(4)
    else setColumns(6)

    if (width < 1200) {
      setRadius(100)
    } else {
      setRadius(200)
    }
  }, [width])

  let leftSpacerIndex = -1
  let rightSpacerIndex = -1

  if (columns === 2) {
    leftSpacerIndex = 0
    rightSpacerIndex = 1
  }
  if (columns === 4) {
    leftSpacerIndex = 1
    rightSpacerIndex = 2
  }
  if (columns === 6) {
    leftSpacerIndex = 2
    rightSpacerIndex = 3
  }

  const headerItems = []
  if (columns > 1) {
    for (let i = 0; i < columns; i++) {
      if (i === leftSpacerIndex) {
        headerItems.push(
          <ShapeSpacer key={`spacer-left`} side="left" radius={radius} />
        )
      } else if (i === rightSpacerIndex) {
        headerItems.push(
          <ShapeSpacer key={`spacer-right`} side="right" radius={radius} />
        )
      } else {
        headerItems.push(<div key={`placeholder-${i}`} style={{ height: 0 }} />)
      }
    }
  }

  // Define components for MDX (responsive images)
  const components = {
    img: (props: any) => (
      <Image
        {...props}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          margin: '10px 0'
        }}
      />
    ),
    h2: (props: any) => (
      <h2
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}
        {...props}
      />
    )
  }

  return (
    <>
      <Container
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 40
        }}
      >
        <h1>WRITE</h1>
        <span>Last Updated: Jan 01 2026' 3:36AM</span>
      </Container>

      <div style={{ width: '100%' }}>
        <Masonry
          className={s.writePage || ''}
          breakpointCols={breakpointColumns}
          columnClassName={s.writeCol || ''}
        >
          {/* Inject Spacers */}
          {headerItems}

          {/* Content Items */}
          {items.map((item) => (
            <div
              key={item.uniqueId}
              className={s.writeItem || ''}
              style={{ position: 'relative' }}
            >
              <span className={s.faintNumber || ''}>
                {item.originalIndex.toString().padStart(3, '0')}
              </span>
              {/* Render MDX content */}
              <div className="mdx-content">
                <MDXRemote {...item.data.mdxSource} components={components} />
              </div>
            </div>
          ))}
        </Masonry>
      </div>
    </>
  )
}
