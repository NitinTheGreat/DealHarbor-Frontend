// app/dashboard/page.tsx
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-3xl font-bold mb-6"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-heading)",
          }}
        >
          Welcome to DealHarbor, {user.firstName}!
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-heading)" }}>
            Your Account
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>Student Verified:</strong> {user.isStudentVerified ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
