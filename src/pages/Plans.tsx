// src/pages/Plans.tsx
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {api} from '../lib/api'
import { useState } from 'react'

type Plan = { id: string; name?: string; price: number; interval?: 'month'|'year' }
type Creator = { id: string; displayName?: string; name?: string; plans?: Plan[] }

export default function Plans() {
  const { id } = useParams()
  const [busy, setBusy] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['creator-detail-for-plans', id],
    queryFn: async () => (await api.get(`/creators/${id}`)).data as Creator,
    enabled: !!id,
    retry: false,
    staleTime: 60_000,
  })

  async function subscribe(planId: string) {
    try {
      setBusy(planId)
     if (!id) throw new Error('creator id is missing')
     const { data } = await api.post(`/creators/${id}/plans/${planId}/checkout`)

      // ① URL 方式
      if (data?.url) { window.location.href = data.url; return }

      // ② sessionId + publishableKey 方式
      const { sessionId, pubKey } = data || {}
      if (!sessionId || !pubKey) throw new Error('Checkout情報が不足しています')
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(pubKey)
      if (!stripe) throw new Error('Stripe初期化に失敗しました')
      await (stripe as any).redirectToCheckout({ sessionId })
    } catch (e: any) {
      alert(e?.message ?? '決済の開始に失敗しました')
    } finally {
      setBusy(null)
    }
  }

  if (isLoading) return <div className="p-6">読み込み中…</div>
  if (error) return <div className="p-6 text-red-600">エラー：{(error as any)?.message}</div>
  if (!data) return null

  const title = data.displayName ?? data.name ?? 'クリエイター'
  const plans = data.plans ?? []

  return (
    <main className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{title} のプラン</h1>

      {plans.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(p => (
            <div key={p.id} className="border rounded p-4">
              <div className="font-semibold">{p.name ?? '購読プラン'}</div>
              <div className="text-2xl font-bold mt-2">
                ¥{p.price.toLocaleString()} <span className="text-sm">/{p.interval ?? 'month'}</span>
              </div>
              <button
                className="mt-4 w-full px-4 py-2 rounded bg-black text-white disabled:opacity-60"
                onClick={() => subscribe(p.id)}
                disabled={!!busy}
              >
                {busy === p.id ? '処理中…' : 'このプランに加入する'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>公開されているプランがありません。</div>
      )}
    </main>
  )
}
