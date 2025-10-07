// src/pages/MyPage.tsx
import { useQuery } from '@tanstack/react-query'
import ProtectedRoute from '../components/ProtectedRoute'
import api from '../lib/api'

type MeSummary = {
  profile: {
    id: string
    email: string
    nickname?: string | null
    role?: 'fan' | 'creator' | 'admin'
  }
  subscriptions?: Array<{
    id: string
    status: string
    startedAt?: string
    renewAt?: string
    planId: string
    planTitle: string
    creatorId: string
    creatorName: string
  }>
  payments?: Array<{
    id: string
    amount: number
    currency: string
    description?: string | null
    createdAt: string
  }>
}

function fmt(dt?: string) {
  if (!dt) return '-'
  const d = new Date(dt)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}

function MePageInner() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<MeSummary>({
    queryKey: ['me_summary'],
    queryFn: async () => (await api.get('/users/me/summary')).data,
    staleTime: 30_000,
  })

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error)
    return (
      <div className="p-6 text-red-600">
        サマリー取得に失敗しました。
        <button
          className="ml-3 border rounded px-3 py-1"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          再試行
        </button>
      </div>
    )

  const profile = data!.profile
  const subs = data!.subscriptions ?? []
  const pays = data!.payments ?? []

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-8">
      {/* プロフィール */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">プロフィール</h2>
          <button
            className="text-sm border rounded px-3 py-1"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            再読込
          </button>
        </div>
        <div className="border rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><span className="text-gray-500">Email：</span>{profile.email}</div>
          <div><span className="text-gray-500">Role：</span>{profile.role ?? '-'}</div>
          <div className="md:col-span-2">
            <span className="text-gray-500">Nickname：</span>{profile.nickname ?? '-'}
          </div>
        </div>
      </section>

      {/* 購読中クリエイター */}
      <section>
        <h2 className="text-xl font-semibold mb-2">購読中クリエイター</h2>
        {subs.length === 0 ? (
          <div className="text-gray-500 border rounded p-4">現在購読中のプランはありません。</div>
        ) : (
          <div className="border rounded divide-y">
            {subs.map(s => (
              <div key={s.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="font-medium">{s.creatorName}（{s.planTitle}）</div>
                <div className="text-sm text-gray-600">
                  状態：{s.status} ／ 開始：{fmt(s.startedAt)} ／ 更新：{fmt(s.renewAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 支払い履歴 */}
      <section>
        <h2 className="text-xl font-semibold mb-2">支払い履歴</h2>
        {pays.length === 0 ? (
          <div className="text-gray-500 border rounded p-4">支払い履歴はありません。</div>
        ) : (
          <div className="border rounded divide-y">
            {pays.map(p => (
              <div key={p.id} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="font-medium">¥{p.amount.toLocaleString()} {p.currency}</div>
                <div className="text-gray-700">{p.description ?? '-'}</div>
                <div className="text-sm text-gray-600 md:text-right">{fmt(p.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function MyPage() {
  return (
    <ProtectedRoute>
      <MePageInner />
    </ProtectedRoute>
  )
}
