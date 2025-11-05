// components/ClientAuth.tsx
"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

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
  checkAuthStatus: () => Promise<User | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      console.log("ClientAuth: Checking auth status...")
      
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // Important: includes session cookie
        headers: {
          Accept: "application/json",
        },
      })

      console.log("ClientAuth: Response status:", response.status)
      console.log("ClientAuth: Response headers:", Object.fromEntries(response.headers.entries()))

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

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Important: includes session cookie
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
    <AuthContext.Provider value={{ user, isLoading, checkAuthStatus, logout }}>
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
