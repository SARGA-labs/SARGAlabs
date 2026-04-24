export interface ProjectData {
  _id: string
  _creationTime: number
  title: string
  description?: string
  imageUrl?: string
  embedCode?: string
  tags?: string[]
  clientName: string
  status: 'active' | 'completed' | 'archived'
  createdAt: Date | string
  updatedAt: Date | string
}
