// components/ui/password-strength.tsx
"use client"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "", color: "" }

    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    // Calculate score
    if (checks.length) score += 1
    if (checks.lowercase) score += 1
    if (checks.uppercase) score += 1
    if (checks.numbers) score += 1
    if (checks.special) score += 1

    // Determine strength
    if (score <= 2) {
      return { score: score * 20, label: "Weak", color: "#ef4444", bgColor: "#fef2f2" }
    } else if (score <= 3) {
      return { score: score * 20, label: "Fair", color: "#f59e0b", bgColor: "#fffbeb" }
    } else if (score <= 4) {
      return { score: score * 20, label: "Good", color: "#10b981", bgColor: "#f0fdf4" }
    } else {
      return { score: 100, label: "Strong", color: "#059669", bgColor: "#ecfdf5" }
    }
  }

  const strength = getPasswordStrength(password)

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: strength.color }}>
          Password Strength: {strength.label}
        </span>
        <span className="text-xs" style={{ color: strength.color }}>
          {strength.score}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${strength.score}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>
      <div className="mt-1 text-xs" style={{ color: "var(--color-subheading)" }}>
        {password.length < 8 && "• At least 8 characters "}
        {!/[a-z]/.test(password) && "• Lowercase letter "}
        {!/[A-Z]/.test(password) && "• Uppercase letter "}
        {!/\d/.test(password) && "• Number "}
        {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && "• Special character "}
      </div>
    </div>
  )
}
