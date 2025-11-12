"use client"

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#FEF5F6] via-[#FFF8F3] to-[#F5F0FF] p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#D97E96] to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-5xl">📡</span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-4xl font-bold text-heading">
          You're Offline
        </h1>

        {/* Description */}
        <p className="font-body text-lg text-subheading">
          It looks like you've lost your internet connection. Don't worry, you can still browse cached pages!
        </p>

        {/* Features */}
        <div className="space-y-3 text-left bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-[#D97E96]/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <span className="font-body text-heading">Browse previously viewed products</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <span className="font-body text-heading">View cached search results</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <span className="font-body text-heading">Access your profile information</span>
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-gradient-to-r from-[#D97E96] to-purple-500 text-white font-heading font-bold rounded-xl hover:shadow-lg transition-all duration-300"
        >
          Try Again
        </button>

        {/* Go Home Link */}
        <a
          href="/"
          className="inline-block font-body text-button hover:text-button-hover underline"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  )
}
