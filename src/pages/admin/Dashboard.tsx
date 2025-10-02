import ProtectedRoute from '../../components/ProtectedRoute'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'

function AdminInner() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin_summary'],
    queryFn: async () => (await api.get('/admin/summary')).data,
  })
  if (isLoading) return <div className="p-6">Loading...</div>
  return (
    <div className="mx-auto max-w-5xl p-4 grid md:grid-cols-3 gap-4">
      <div className="border rounded p-3"><div className="text-sm text-gray-500">月間売上</div><div className="text-2xl">¥{data.salesMonthly}</div></div>
      <div className="border rounded p-3"><div className="text-sm text-gray-500">新規登録</div><div className="text-2xl">{data.newUsersMonthly}</div></div>
      <div className="border rounded p-3"><div className="text-sm text-gray-500">通報(未対応)</div><div className="text-2xl">{data.reportsPending}</div></div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminInner />
    </ProtectedRoute>
  )
}