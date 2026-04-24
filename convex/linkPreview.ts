'use node'

import { v } from 'convex/values'
import { action } from './_generated/server'
import * as cheerio from 'cheerio'

export const fetchLinkPreview = action({
  args: { url: v.string() },
  handler: async (_, args) => {
    try {
      const res = await fetch(args.url, {
        headers: {
          'User-Agent': 'Sarga-Portal-Bot/1.0'
        }
      })

      if (!res.ok) {
        return { title: undefined, description: undefined, image: undefined }
      }

      const html = await res.text()
      const $ = (cheerio as any).load(html)

      const getMeta = (property: string, name: string): string | undefined => {
        return (
          $(`meta[property="${property}"]`).attr('content') ||
          $(`meta[name="${name}"]`).attr('content') ||
          undefined
        )
      }

      const title =
        getMeta('og:title', 'title') || $('title').text() || undefined
      const description = getMeta('og:description', 'description') || undefined
      let image = getMeta('og:image', 'image') || undefined

      // Handle relative image URLs
      if (image && !image.startsWith('http')) {
        try {
          const urlObj = new URL(args.url)
          image = new URL(image, urlObj.origin).toString()
        } catch (e) {
          // Ignore
        }
      }

      return {
        title: title?.trim(),
        description: description?.trim(),
        image: image?.trim()
      }
    } catch (error) {
      console.error('Failed to fetch link preview', error)
      return { title: undefined, description: undefined, image: undefined }
    }
  }
})
