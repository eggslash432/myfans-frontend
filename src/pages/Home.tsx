import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Link } from 'react-router-dom'


export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['creators'],
    queryFn: async () => (await api.get('/creators')).data,
  })


  if (isLoading) return <div className="p-6">Loading...</div>


  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="text-2xl font-bold mb-3">新着クリエイター</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.items?.map((c: any) => (
          <Link key={c.id} to={`/creator/${c.id}`} className="border rounded p-3 hover:shadow">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-gray-500">投稿 {c.postsCount ?? 0}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}