import { getCurrentUser } from '@/lib/auth'

export default async function AdminPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Stats Cards */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Stakeholders</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Programs</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to the Admin Dashboard</h2>
        <p className="mt-4 text-gray-600">
          This is your Business Improvement District stakeholder management portal. Here you can manage stakeholders,
          track programs, and monitor activities across your organization.
        </p>

        {user && (
          <div className="mt-6 space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Role:</span> {user.role}
            </p>
          </div>
        )}
      </div>

      {/* Features Coming Soon */}
      <div className="rounded-lg bg-blue-50 p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900">Coming Soon</h3>
        <ul className="mt-2 space-y-1 text-blue-800">
          <li>• Stakeholder Management</li>
          <li>• Program Tracking</li>
          <li>• Analytics and Reports</li>
          <li>• User Management</li>
        </ul>
      </div>
    </div>
  )
}
