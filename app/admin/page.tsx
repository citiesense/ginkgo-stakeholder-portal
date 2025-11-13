import { getCurrentUser } from '@/lib/auth'
import { GinkgoSetupForm } from './ginkgo-setup-form'

export default async function AdminPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to the Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Manage your Business Improvement District stakeholders and campaigns using Ginkgo
        </p>
      </div>

      {/* Ginkgo Setup Section - Main Focus */}
      <GinkgoSetupForm />

      {/* Quick Start Info */}
      <div className="rounded-lg bg-blue-50 p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-4">How to Get Started</h3>
        <ol className="space-y-3 text-sm text-blue-800">
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">1.</span>
            <span><span className="font-medium">Connect Ginkgo:</span> Enter your Community ID and API Key above</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">2.</span>
            <span><span className="font-medium">Verify Connection:</span> We'll validate and show available data</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">3.</span>
            <span><span className="font-medium">Create Campaign:</span> Use the "New Campaign" page to create verification campaigns</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">4.</span>
            <span><span className="font-medium">Share & Track:</span> Share campaigns with team members and monitor results</span>
          </li>
        </ol>
      </div>

      {/* Account Info */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h3>
        {user && (
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Email:</span> {user.email}
            </p>
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Role:</span> {user.role}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
