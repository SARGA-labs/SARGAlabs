import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'

const CONTENT_PATH = path.join(process.cwd(), 'src/content/write')

export async function getAllMdxContent() {
  // Create directory if it doesn't exist (safety check)
  if (!fs.existsSync(CONTENT_PATH)) {
    return []
  }

  const files = fs.readdirSync(CONTENT_PATH).filter((file) => file.endsWith('.mdx'))

  const posts = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(CONTENT_PATH, filename)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)
      
      const mdxSource = await serialize(content)

      return {
        id: data.id || filename,
        frontmatter: data,
        mdxSource,
      }
    })
  )

  // Sort by ID if present, or filename
  return posts.sort((a, b) => (Number(a.id) > Number(b.id) ? 1 : -1))
}
