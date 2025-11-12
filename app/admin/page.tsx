import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

export default async function AdminPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to the Admin Dashboard</h2>
          <p className="text-gray-600">Manage your Business Improvement District stakeholders and campaigns</p>
        </div>
        <Link
          href="/admin/onboard"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + Onboard Tenant
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Stats Cards */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Tenants</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Campaigns</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Verified Recipients</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>

      {/* User Info Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900">Your Account</h3>
        {user && (
          <div className="mt-4 space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Role:</span> {user.role}
            </p>
          </div>
        )}
      </div>

      {/* Quick Start Guide */}
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900">Getting Started</h3>
        <ol className="mt-4 space-y-2 text-sm text-blue-800">
          <li>1. <span className="font-medium">Onboard Tenant:</span> Create a new BID organization</li>
          <li>2. <span className="font-medium">Configure ESP:</span> Connect your email provider</li>
          <li>3. <span className="font-medium">Create Campaign:</span> Set up a verification campaign</li>
          <li>4. <span className="font-medium">Import Recipients:</span> Upload stakeholder contacts</li>
          <li>5. <span className="font-medium">Monitor Results:</span> Track engagement and responses</li>
        </ol>
      </div>

      {/* Features Coming Soon */}
      <div className="rounded-lg bg-amber-50 p-6 border border-amber-200">
        <h3 className="font-semibold text-amber-900">Coming Soon</h3>
        <ul className="mt-2 space-y-1 text-amber-800">
          <li>• Tenant Management & Configuration</li>
          <li>• Verification Campaign Builder</li>
          <li>• ESP Connection Management</li>
          <li>• Analytics and Reports Dashboard</li>
          <li>• Recipient Management</li>
        </ul>
      </div>
    </div>
  )
}
