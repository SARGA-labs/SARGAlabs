import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useFavicon() {
  const pathname = usePathname()

  useEffect(() => {
    let text = 'S' // Default

    if (pathname?.startsWith('/write')) {
      text = 'W.S'
    } else if (pathname?.startsWith('/studio')) {
      text = 'S.S'
    }

    // Create SVG data URI
    // Minimal SVG with white text on black background (or vice versa depending on theme, but let's go with standard black text on white or inverse for visibility)
    // Actually, user asked for "Just say S", "W.S", "S.S". 
    // Let's make it clean: simple sans-serif text.
    
    // Check system preference for dark mode to adjust favicon color if needed, 
    // but usually a solid contrast works best. Let's try white text on black circle or just text.
    // "Just say S" implies text. 
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <style>
          text {
            font-family: sans-serif;
            font-weight: bold;
            font-size: 80px;
            fill: black; 
          }
          @media (prefers-color-scheme: dark) {
            text { fill: white; }
          }
        </style>
        <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>
    `
    
    const iconUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`

    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
    if (link) {
      link.href = iconUrl
    } else {
      const newLink = document.createElement('link')
      newLink.rel = 'icon'
      newLink.href = iconUrl
      document.head.appendChild(newLink)
    }

  }, [pathname])
}
