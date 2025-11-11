export default function ThankYouPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
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

        <h1 className="text-3xl font-bold text-gray-900">Thank You!</h1>
        <p className="mt-4 text-gray-600">
          Your verification has been successfully submitted. We appreciate you taking the time to
          confirm your information.
        </p>

        <div className="mt-8 rounded-lg bg-blue-50 p-4 border border-blue-200 text-left">
          <h3 className="font-semibold text-blue-900">What happens next?</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li>✓ Your information has been recorded</li>
            <li>✓ Our team will review your submission</li>
            <li>✓ You'll receive updates based on your communication preferences</li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          If you have any questions, please contact your local Business Improvement District.
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
