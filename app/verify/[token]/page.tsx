import { validateVerificationToken } from '@/lib/verifyToken'
import VerificationForm from './form'

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Validate token on server
  const validation = await validateVerificationToken(token)

  if (!validation.valid && validation.error === 'already_submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Already Submitted</h1>
          <p className="mt-2 text-gray-600">
            Thank you! This verification has already been submitted.
          </p>

          <p className="mt-6 text-sm text-gray-600">
            If you believe this is an error or have additional information to provide:
          </p>

          <a
            href={`/verify/${token}/report`}
            className="mt-4 inline-block text-blue-600 hover:underline font-medium"
          >
            Report an issue
          </a>
        </div>
      </div>
    )
  }

  if (!validation.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Link Invalid</h1>
          <p className="mt-4 text-gray-600">{validation.error}</p>

          <p className="mt-6 text-sm text-gray-600">
            Please request a new verification email from your Business Improvement District.
          </p>

          <a
            href="/"
            className="mt-6 inline-block text-blue-600 hover:underline font-medium"
          >
            Return to home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <VerificationForm token={token} recipientId={validation.recipient?.id || ''} />
    </div>
  )
}
