import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'


export default function Creator() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['creator', id],
    queryFn: async () => (await api.get(`/creators/${id}`)).data,
  })

  const { data: plans } = useQuery({
    queryKey: ['plans', id],
    queryFn: async () => (await api.get(`/creators/${id}/plans`)).data,
  })

  const { data: posts } = useQuery({
    queryKey: ['posts', id],
    queryFn: async () => (await api.get(`/creators/${id}/posts`)).data,
  })

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{data?.name}</h1>
        <p className="text-gray-600">{data?.bio}</p>
      </div>

      <section>
        <h2 className="font-semibold mb-2">プラン</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans?.items?.map((p: any) => (
            <Link key={p.id} to={`/creator/${id}/plans`} className="border rounded p-3 hover:shadow">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm">¥{p.price} / {p.interval}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">投稿</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {posts?.items?.map((post: any) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="border rounded p-3 hover:shadow">
              <div className="font-semibold">{post.title}</div>
              <div className="text-sm text-gray-500">{post.isFree ? '無料' : '限定/有料'}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}