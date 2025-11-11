import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          Stakeholder Portal
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Business Improvement District Management Platform
        </p>
        <p className="mb-12 text-gray-600">
          Welcome to the stakeholder portal for managing your Business Improvement District and place management initiatives.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/admin"
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Admin Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-900 hover:border-gray-400 transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </main>
  )
}
