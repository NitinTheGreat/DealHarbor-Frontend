// components/ui/animated-button.tsx
"use client"

import type React from "react"

import { LoadingSpinner } from "./loading-spinner"

interface AnimatedButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  className?: string
  style?: React.CSSProperties
}

export function AnimatedButton({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  style,
}: AnimatedButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative overflow-hidden transition-all duration-300 transform
        hover:scale-105 active:scale-95 disabled:scale-100
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={style}
    >
      <div
        className={`flex items-center justify-center gap-2 ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
      >
        {children}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}

      {/* Ripple effect */}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200 pointer-events-none" />
    </button>
  )
}
