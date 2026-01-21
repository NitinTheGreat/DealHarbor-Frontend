// components/ClientAuth.tsx
"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

const AUTH_TOKEN_KEY = "dealharbor_auth_token"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isStudentVerified: boolean
  profilePhotoUrl: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  token: string | null
  checkAuthStatus: () => Promise<User | null>
  logout: () => Promise<void>
  loginWithToken: (token: string) => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      console.log("ClientAuth: Checking auth status...")

      // IMPORTANT: Use hardcoded backend URL for consistency with OAuth flow
      const BACKEND_URL = "https://yqstbpypmm.ap-south-1.awsapprunner.com"

      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include", // Important: includes session cookie
        headers: {
          Accept: "application/json",
        },
      })

      console.log("ClientAuth: Response status:", response.status)

      if (response.ok) {
        const userData = await response.json()
        console.log("ClientAuth: User authenticated:", userData)
        setUser(userData)
        return userData
      } else {
        const errorText = await response.text()
        console.log("ClientAuth: No user found (status:", response.status, ")", errorText)
        setUser(null)
        return null
      }
    } catch (error) {
      console.error("ClientAuth: Error checking auth status:", error)
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
      console.log("ClientAuth: Auth check complete")
    }
  }

  // Login with a JWT token (used by OAuth callback)
  const loginWithToken = async (jwtToken: string): Promise<User | null> => {
    setIsLoading(true)
    try {
      console.log("ClientAuth: Logging in with OAuth token...")

      // Store token in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, jwtToken)
      setToken(jwtToken)

      // Verify token and get user info
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        console.log("ClientAuth: OAuth login successful:", userData)
        setUser(userData)
        return userData
      } else {
        console.error("ClientAuth: OAuth token validation failed")
        localStorage.removeItem(AUTH_TOKEN_KEY)
        setToken(null)
        setUser(null)
        return null
      }
    } catch (error) {
      console.error("ClientAuth: OAuth login error:", error)
      localStorage.removeItem(AUTH_TOKEN_KEY)
      setToken(null)
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const logout = async () => {
    try {
      // IMPORTANT: Use hardcoded backend URL for consistency
      const BACKEND_URL = "https://yqstbpypmm.ap-south-1.awsapprunner.com"

      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      setUser(null)
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if API fails
      setUser(null)
      window.location.href = "/login"
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, token, checkAuthStatus, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper function to get auth token (for use in API calls)
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

// Helper function to get auth headers for API calls
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}
