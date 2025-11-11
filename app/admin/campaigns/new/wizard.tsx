'use client'

import { useState } from 'react'
import { createCampaign } from '@/lib/actions/campaign'
import { type CreateCampaignInput, type VerificationRecipientData } from '@/lib/validation/campaign'

interface CampaignWizardProps {
  tenantId: string
  onCampaignCreated: (
    campaign: { id: string; name: string; recipientCount: number },
    recipients: VerificationRecipientData[]
  ) => void
}

export default function CampaignWizard({ tenantId, onCampaignCreated }: CampaignWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const [formData, setFormData] = useState({
    campaignName: '',
    audienceType: 'both' as const,
    filtersJson: '{}',
    deliveryMethod: 'csv_export' as const,
    hasEspConnection: false, // Would be fetched from tenant
  })

  const handleAudienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      audienceType: e.target.value as 'property_owners' | 'business_owners' | 'both',
    }))
  }

  const handleFiltersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      filtersJson: e.target.value,
    }))
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      campaignName: e.target.value,
    }))
  }

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      deliveryMethod: e.target.value as 'csv_export' | 'esp_push',
    }))
  }

  const validateStep = (currentStep: number): boolean => {
    setError('')

    if (currentStep === 1) {
      if (!formData.campaignName.trim()) {
        setError('Campaign name is required')
        return false
      }

      // Validate JSON filters
      try {
        JSON.parse(formData.filtersJson || '{}')
      } catch {
        setError('Invalid JSON in filters')
        return false
      }

      return true
    }

    if (currentStep === 2) {
      if (!formData.deliveryMethod) {
        setError('Delivery method is required')
        return false
      }
      return true
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((step + 1) as 1 | 2 | 3)
    }
  }

  const handleBack = () => {
    setStep((step - 1) as 1 | 2 | 3)
    setError('')
  }

  const handleGenerateCampaign = async () => {
    if (!validateStep(3)) return

    setLoading(true)
    setError('')

    try {
      const input: CreateCampaignInput = {
        tenantId,
        name: formData.campaignName,
        audienceType: formData.audienceType,
        filtersJson: JSON.parse(formData.filtersJson || '{}'),
        deliveryMethod: formData.deliveryMethod,
      }

      const result = await createCampaign(input, 'current-user-id') // TODO: Get actual user ID

      if (result.success && result.campaign && result.recipients) {
        onCampaignCreated(result.campaign, result.recipients)
      } else {
        setError(result.error || 'Failed to create campaign')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-white p-8 shadow">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                    s <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`mx-2 h-1 w-16 ${
                      s < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs font-medium text-gray-600">
            <span>Audience</span>
            <span>Delivery</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step 1: Audience */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Configure Audience</h2>
              <p className="mt-2 text-gray-600">Select who should receive this verification campaign</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.campaignName}
                onChange={handleNameChange}
                placeholder="e.g., Q1 Property Owner Verification"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Audience Type *</legend>
              <div className="mt-3 space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="audience"
                    value="property_owners"
                    checked={formData.audienceType === 'property_owners'}
                    onChange={handleAudienceChange}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">Property Owners Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="audience"
                    value="business_owners"
                    checked={formData.audienceType === 'business_owners'}
                    onChange={handleAudienceChange}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">Business Owners Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="audience"
                    value="both"
                    checked={formData.audienceType === 'both'}
                    onChange={handleAudienceChange}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">Both Property & Business Owners</span>
                </label>
              </div>
            </fieldset>

            <div>
              <label htmlFor="filters" className="block text-sm font-medium text-gray-700 mb-2">
                Filters (JSON)
              </label>
              <textarea
                id="filters"
                value={formData.filtersJson}
                onChange={handleFiltersChange}
                placeholder={'{\n  "neighborhood": "downtown",\n  "status": "active"\n}'}
                className="block w-full h-24 rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional: Apply additional filters to narrow the audience
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Delivery Method */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Delivery Method</h2>
              <p className="mt-2 text-gray-600">How should recipients receive their verification links?</p>
            </div>

            <fieldset>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="delivery"
                    value="csv_export"
                    checked={formData.deliveryMethod === 'csv_export'}
                    onChange={handleDeliveryChange}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Download CSV</p>
                    <p className="text-sm text-gray-600">Export recipients with verification links for manual delivery</p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg transition ${
                    formData.hasEspConnection
                      ? 'border-gray-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50'
                      : 'border-gray-200 cursor-not-allowed opacity-50 bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="esp_push"
                    checked={formData.deliveryMethod === 'esp_push'}
                    onChange={handleDeliveryChange}
                    disabled={!formData.hasEspConnection}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Send via Email Service</p>
                    <p className="text-sm text-gray-600">
                      {formData.hasEspConnection
                        ? 'Send emails directly through your connected email service'
                        : 'Configure an email service provider (Mailchimp, Constant Contact) first'}
                    </p>
                  </div>
                </label>
              </div>
            </fieldset>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review & Generate</h2>
              <p className="mt-2 text-gray-600">Confirm your campaign settings before generating</p>
            </div>

            <div className="space-y-4 rounded-lg bg-gray-50 p-6">
              <div>
                <p className="text-sm text-gray-600">Campaign Name</p>
                <p className="mt-1 font-semibold text-gray-900">{formData.campaignName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Audience Type</p>
                <p className="mt-1 font-semibold text-gray-900 capitalize">
                  {formData.audienceType.replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Delivery Method</p>
                <p className="mt-1 font-semibold text-gray-900 capitalize">
                  {formData.deliveryMethod === 'csv_export' ? 'Download CSV' : 'Email Service'}
                </p>
              </div>

              {JSON.stringify(JSON.parse(formData.filtersJson)).length > 2 && (
                <div>
                  <p className="text-sm text-gray-600">Filters</p>
                  <p className="mt-1 font-mono text-sm text-gray-900 bg-white p-2 rounded border border-gray-200">
                    {formData.filtersJson}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-blue-900">
                ℹ️ Clicking "Generate" will create the campaign, fetch recipients from the Ginkgo API, and generate
                verification links for each recipient.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="rounded-lg border-2 border-gray-300 px-6 py-2 font-semibold text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerateCampaign}
              disabled={loading}
              className="flex-1 rounded-lg bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating Campaign...' : 'Generate Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
