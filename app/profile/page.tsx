"use client"

import { Suspense } from "react"
import ProfileComponent from "./components/ProfilePageComponent"

function ProfilePageContent() {
  return <ProfileComponent />
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p style={{ color: "var(--color-text)" }}>Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  )
}
