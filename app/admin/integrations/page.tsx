'use client'

import { useState } from 'react'
import { listEspConnections } from '@/lib/actions/esp'
import EspConnectionForm from './esp-form'
import { useEffect } from 'react'
import { isFeatureEnabled } from '@/lib/featureFlags'

export default function IntegrationsPage() {
  const espEnabled = isFeatureEnabled('ESP_ENABLED')
  const [connections, setConnections] = useState<
    Array<{
      id: string
      provider: string
      listId: string | null
      createdAt: Date
    }>
  >([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'mailchimp' | 'constant_contact'>('mailchimp')

  // TODO: Get tenantId from context/params
  const tenantId = 'placeholder-tenant-id'

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true)
      try {
        const conns = await listEspConnections(tenantId)
        setConnections(conns)
      } catch (error) {
        console.error('Failed to fetch connections:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConnections()
  }, [tenantId])

  const handleFormSuccess = () => {
    setShowForm(false)
    // Refresh connections list
    listEspConnections(tenantId).then(conns => setConnections(conns))
  }

  const hasMailchimp = connections.some(c => c.provider === 'mailchimp')
  const hasConstantContact = connections.some(c => c.provider === 'constant_contact')

  if (!espEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="mt-2 text-gray-600">ESP integrations are currently disabled</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-6 border border-amber-200">
          <h3 className="font-semibold text-amber-900">Feature Disabled</h3>
          <p className="mt-2 text-amber-800">
            Email Service Provider integrations are not currently enabled. Contact your system administrator to enable this feature.
          </p>
          <p className="mt-2 text-sm text-amber-700">
            Set <code className="font-mono">FEATURE_ESP_ENABLED=true</code> in your environment configuration.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="mt-2 text-gray-600">Connect your email service provider to send verification campaigns</p>
      </div>

      {/* Connection Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mailchimp */}
        <div className="rounded-lg bg-white p-6 shadow border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Mailchimp</h3>
              <p className="text-sm text-gray-600 mt-1">Email marketing platform</p>
            </div>
            {hasMailchimp && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            )}
          </div>

          {hasMailchimp ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">List:</span>{' '}
                <span className="font-mono text-gray-900">
                  {connections.find(c => c.provider === 'mailchimp')?.listId}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Connected:</span>{' '}
                <span className="text-gray-900">
                  {new Date(
                    connections.find(c => c.provider === 'mailchimp')?.createdAt || ''
                  ).toLocaleDateString()}
                </span>
              </p>
              <button
                onClick={() => {
                  setSelectedProvider('mailchimp')
                  setShowForm(true)
                }}
                className="mt-4 text-blue-600 hover:underline font-medium text-sm"
              >
                Update Connection
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setSelectedProvider('mailchimp')
                setShowForm(true)
              }}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-medium text-gray-900 hover:border-gray-400 transition-colors"
            >
              Connect
            </button>
          )}
        </div>

        {/* Constant Contact */}
        <div className="rounded-lg bg-white p-6 shadow border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Constant Contact</h3>
              <p className="text-sm text-gray-600 mt-1">Customer relationship management</p>
            </div>
            {hasConstantContact && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            )}
          </div>

          {hasConstantContact ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">List:</span>{' '}
                <span className="font-mono text-gray-900">
                  {connections.find(c => c.provider === 'constant_contact')?.listId}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Connected:</span>{' '}
                <span className="text-gray-900">
                  {new Date(
                    connections.find(c => c.provider === 'constant_contact')?.createdAt || ''
                  ).toLocaleDateString()}
                </span>
              </p>
              <button
                onClick={() => {
                  setSelectedProvider('constant_contact')
                  setShowForm(true)
                }}
                className="mt-4 text-blue-600 hover:underline font-medium text-sm"
              >
                Update Connection
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setSelectedProvider('constant_contact')
                setShowForm(true)
              }}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-medium text-gray-900 hover:border-gray-400 transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900">Why connect an email service?</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• Automatically send verification campaigns to recipients</li>
          <li>• Track opens, clicks, bounces, and unsubscribes</li>
          <li>• Sync recipient information to your email list</li>
          <li>• Manage compliance and list health</li>
        </ul>
      </div>

      {/* Modal/Form */}
      {showForm && (
        <EspConnectionForm
          provider={selectedProvider}
          tenantId={tenantId}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
