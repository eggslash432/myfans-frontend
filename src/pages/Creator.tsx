// src/pages/Creator.tsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

type Plan = { id: string; name?: string; price: number; interval?: 'month'|'year' }
type Post = { id: string; title: string; isFree?: boolean }
type CreatorDetail = {
  id: string
  name?: string
  displayName?: string
  bio?: string
  plans?: Plan[]
  posts?: Post[] | { items: Post[] }
}

export default function Creator() {
  const { id } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['creator-detail', id],
    queryFn: async () => (await api.get(`/creators/${id}`)).data as CreatorDetail,
    enabled: !!id,
    retry: false,
    staleTime: 60_000,
  })

  // もしサーバが plans/posts を別エンドポイントで返す設計なら、下記のように追加取得する：
  // const { data: plansRes } = useQuery({
  //   queryKey: ['creator-plans', id],
  //   queryFn: async () => (await api.get(`/creators/${id}/plans`)).data,
  //   enabled: !!id && (!data?.plans || data.plans.length === 0),
  // })
  // const { data: postsRes } = useQuery({
  //   queryKey: ['creator-posts', id],
  //   queryFn: async () => (await api.get(`/creators/${id}/posts`)).data,
  //   enabled: !!id && (!data?.posts || (Array.isArray(data.posts) && data.posts.length === 0)),
  // })

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">エラー：{(error as any)?.message}</div>
  if (!data) return null

  const title = data.displayName ?? data.name ?? 'クリエイター'
  // posts は配列 or {items:[]} どちらも吸収
  const postsArray: Post[] = Array.isArray(data.posts) ? data.posts : (data.posts as any)?.items ?? []

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-600">{data.bio ?? ''}</p>
      </div>

      <section>
        <h2 className="font-semibold mb-2">プラン</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(data.plans ?? []).map((p: Plan) => (
            <Link key={p.id} to={`/creator/${id}/plans`} className="border rounded p-3 hover:shadow">
              <div className="font-semibold">{p.name ?? '購読プラン'}</div>
              <div className="text-sm">¥{p.price} / {p.interval ?? 'month'}</div>
            </Link>
          ))}
          {(!data.plans || data.plans.length === 0) && (
            <Link to={`/creator/${id}/plans`} className="border rounded p-3 hover:shadow">
              プランページへ
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">投稿</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {postsArray.map((post: Post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="border rounded p-3 hover:shadow">
              <div className="font-semibold">{post.title}</div>
              <div className="text-sm text-gray-500">{post.isFree ? '無料' : '限定/有料'}</div>
            </Link>
          ))}
          {postsArray.length === 0 && <div className="text-gray-500">投稿はまだありません。</div>}
        </div>
      </section>
    </div>
  )
}
