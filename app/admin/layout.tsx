import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Check authentication - redirect to login if not authenticated
  if (!user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Portal</h2>
        </div>
        <nav className="space-y-2 p-6">
          <Link
            href="/admin"
            className="block rounded px-4 py-2 hover:bg-gray-800"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="block rounded px-4 py-2 hover:bg-gray-800"
          >
            Home
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="text-gray-600">
              Welcome, <span className="font-semibold">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
