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
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user data from cookie (non-httpOnly cookie for client access)
    const getUserFromCookie = () => {
      try {
        const userDataCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user_data="))
          ?.split("=")[1]

        if (userDataCookie) {
          const userData = JSON.parse(decodeURIComponent(userDataCookie))
          setUser(userData)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUserFromCookie()
  }, [])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
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

  return <AuthContext.Provider value={{ user, isLoading, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
