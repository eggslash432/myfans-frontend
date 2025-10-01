import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'


export default function PostDetail() {
  const { id } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => (await api.get(`/posts/${id}`)).data,
  })

  if (isLoading) return <div className="p-6">Loading...</div>
  if ((error as any)?.response?.status === 403) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <p className="mb-3">この投稿は購読者限定です。</p>
        <Link to={`/creator/${data?.creatorId}/plans`} className="underline">プランに加入する</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
      <article className="prose max-w-none">
        {data.body}
      </article>
      {Array.isArray(data.mediaUrls) && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.mediaUrls.map((u: string) => (
            <img key={u} src={u} className="rounded" />
          ))}
        </div>
      )}
    </div>
  )
}