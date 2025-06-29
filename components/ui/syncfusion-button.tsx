// components/ui/syncfusion-button.tsx
"use client"

import type React from "react"

import { ButtonComponent } from "@syncfusion/ej2-react-buttons"
import { useEffect } from "react"
import { registerSyncfusionLicense } from "@/lib/syncfusion-license"

interface SyncfusionButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  isPrimary?: boolean
  isLoading?: boolean
  className?: string
  type?: "button" | "submit" | "reset"
}

export function SyncfusionButton({
  children,
  onClick,
  disabled = false,
  isPrimary = false,
  isLoading = false,
  className = "",
  type = "button",
}: SyncfusionButtonProps) {
  useEffect(() => {
    registerSyncfusionLicense()
  }, [])

  return (
    <ButtonComponent
      cssClass={`e-btn ${isPrimary ? "e-primary" : ""} ${className} ${isLoading ? "e-loading" : ""}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {isLoading ? "Loading..." : children}
    </ButtonComponent>
  )
}
