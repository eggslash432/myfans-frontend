export type User = {
  id: string
  email: string
  nickname?: string
  role?: 'user' | 'creator' | 'admin'
}

export type Creator = {
  id: string
  name: string
  avatarUrl?: string
  bio?: string
}

export type Plan = {
  id: string
  title: string
  price: number // 円
  interval: 'month' | 'year'
  creatorId: string
}

export type Post = {
  id: string
  title: string
  body?: string
  mediaUrls?: string[]
  isFree: boolean
  pricePPV?: number
  creatorId: string
}