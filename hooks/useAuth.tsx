// hooks/useAuth.tsx
"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isStudentVerified: boolean
  profilePhotoUrl: string
}

interface AuthData {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
  needsStudentVerification?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (authData: AuthData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "dealharbor_access_token"
const REFRESH_TOKEN_KEY = "dealharbor_refresh_token"
const USER_KEY = "dealharbor_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem(TOKEN_KEY)
        const userData = localStorage.getItem(USER_KEY)

        if (accessToken && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)

          // Verify token is still valid
          const isValid = await verifyToken(accessToken)
          if (!isValid) {
            // Try to refresh token
            const refreshed = await refreshToken()
            if (!refreshed) {
              await logout()
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        await logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (authData: AuthData) => {
    try {
      // Store tokens and user data
      localStorage.setItem(TOKEN_KEY, authData.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user))

      setUser(authData.user)

      // Set up token refresh timer
      scheduleTokenRefresh(authData.expiresIn)
    } catch (error) {
      console.error("Login storage error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      // Call logout API if refresh token exists
      if (refreshToken) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout?refreshToken=${refreshToken}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
          })
        } catch (error) {
          console.error("Logout API error:", error)
          // Continue with local logout even if API fails
        }
      }
    } finally {
      // Clear local storage
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)

      setUser(null)
      router.push("/login")
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY)

      if (!refreshTokenValue) {
        return false
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh?refreshToken=${refreshTokenValue}`,
        {
          method: "POST",
        },
      )

      if (!response.ok) {
        return false
      }

      const data = await response.json()

      // Update stored tokens
      localStorage.setItem(TOKEN_KEY, data.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)

      // Schedule next refresh
      scheduleTokenRefresh(data.expiresIn)

      return true
    } catch (error) {
      console.error("Token refresh error:", error)
      return false
    }
  }

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.ok
    } catch (error) {
      return false
    }
  }

  const scheduleTokenRefresh = (expiresIn: number) => {
    // Refresh token 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000

    setTimeout(async () => {
      const success = await refreshToken()
      if (!success) {
        await logout()
      }
    }, refreshTime)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
