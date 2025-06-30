// components/ui/password-match.tsx
"use client"

interface PasswordMatchProps {
  password: string
  confirmPassword: string
}

export function PasswordMatch({ password, confirmPassword }: PasswordMatchProps) {
  if (!confirmPassword) return null

  const isMatch = password === confirmPassword
  const color = isMatch ? "#10b981" : "#ef4444"
  const bgColor = isMatch ? "#f0fdf4" : "#fef2f2"

  return (
    <div
      className="mt-2 p-2 rounded-md text-xs font-medium transition-all duration-200"
      style={{ backgroundColor: bgColor, color }}
    >
      {isMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
    </div>
  )
}
