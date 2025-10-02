import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import ProtectedRoute from '../components/ProtectedRoute'


function MyPageInner() {
const { data, isLoading } = useQuery({
queryKey: ['me'],
queryFn: async () => (await api.get('/users/me/summary')).data,
})
if (isLoading) return <div className="p-6">Loading...</div>
return (
<div className="mx-auto max-w-4xl p-4 space-y-6">
<section>
<h2 className="text-xl font-semibold mb-2">プロフィール</h2>
<div className="border rounded p-3">
<div>Email: {data.email}</div>
<div>ニックネーム: {data.nickname ?? '-'}</div>
</div>
</section>


<section>
<h2 className="text-xl font-semibold mb-2">購読中クリエイター</h2>
<ul className="list-disc pl-5">
{data.subscriptions?.map((s: any) => (
<li key={s.id}>{s.creatorName}（{s.planTitle}）</li>
))}
</ul>
</section>


<section>
<h2 className="text-xl font-semibold mb-2">支払い履歴</h2>
<ul className="list-disc pl-5">
{data.payments?.map((p: any) => (
<li key={p.id}>¥{p.amount} / {p.description} / {new Date(p.createdAt).toLocaleString()}</li>
))}
</ul>
</section>
</div>
)
}


export default function MyPage() {
return (
<ProtectedRoute>
<MyPageInner />
</ProtectedRoute>
)
}