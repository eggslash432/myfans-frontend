import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { getStripe } from '../lib/stripe'


export default function Plans() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['plans', id],
    queryFn: async () => (await api.get(`/creators/${id}/plans`)).data,
  })

  const checkout = useMutation({
    mutationFn: async (planId: string) => {
      // バックエンドでCheckout Sessionを作成
      const { data } = await api.post('/billing/checkout', { planId })
      const stripe = await getStripe()
      await stripe?.redirectToCheckout({ sessionId: data.sessionId })
    },
  })

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="mx-auto max-w-5xl p-4 grid gap-3 md:grid-cols-3">
      {data?.items?.map((p: any) => (
        <div key={p.id} className="border rounded p-4">
          <div className="font-semibold">{p.title}</div>
          <div className="text-2xl my-2">¥{p.price}<span className="text-base">/{p.interval}</span></div>
          <button onClick={() => checkout.mutate(p.id)} className="w-full border rounded py-2">
            加入する
          </button>
        </div>
      ))}
    </div>
  )
}