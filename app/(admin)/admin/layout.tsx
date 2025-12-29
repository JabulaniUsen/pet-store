import { requireAdmin } from '@/lib/admin/auth'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r bg-white shadow-sm sticky top-0 h-screen overflow-y-auto">
        <AdminNav />
      </aside>
      <main className="flex-1 min-h-screen">
        <div className="p-6 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}

