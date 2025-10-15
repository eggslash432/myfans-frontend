// src/pages/Home.tsx
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Link } from 'react-router-dom'

type Creator = {
  id: string
  name?: string
  displayName?: string
  avatarUrl?: string
  postsCount?: number
  _count?: { posts?: number }
}

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      const res = await api.get('/creators', { params: { limit: 12 } })
      const raw = res.data
      const items: Creator[] = Array.isArray(raw) ? raw : (raw?.items ?? [])
      // 正規化
      return items.map(c => ({
        ...c,
        postsCount: c.postsCount ?? c._count?.posts ?? 0,
      }))
    },
    staleTime: 60_000,
    retry: false,
  })

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">エラー：{(error as any)?.message ?? '取得に失敗しました'}</div>

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-3">新着クリエイター</h1>
        <Link to="/mypage" className="text-indigo-600 underline">マイページへ</Link>
      </div>

      {(!data || data.length === 0) && (
        <div className="text-gray-500">クリエイターがまだいません。</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.map((c: Creator) => (
          <div key={c.id} className="border rounded p-3 hover:shadow">
            <Link to={`/creator/${c.id}`} className="block">
              <div className="font-semibold">{c.displayName ?? c.name ?? 'クリエイター'}</div>
              <div className="text-sm text-gray-500">投稿 {c.postsCount ?? 0}</div>
            </Link>
            <div className="mt-3">
              <Link
                to={`/creator/${c.id}/plans`}
                className="inline-block w-full px-4 py-2 rounded bg-black text-white text-center"
              >
                このクリエイターを購読
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
