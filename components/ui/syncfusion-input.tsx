// components/ui/syncfusion-input.tsx
"use client"

import { TextBoxComponent } from "@syncfusion/ej2-react-inputs"
import { useEffect } from "react"
import { registerSyncfusionLicense } from "@/lib/syncfusion-license"

interface SyncfusionInputProps {
  placeholder?: string
  value?: string
  onChange?: (args: any) => void
  type?: "text" | "email" | "password"
  disabled?: boolean
  required?: boolean
  className?: string
  floatLabelType?: "Auto" | "Always" | "Never"
}

export function SyncfusionInput({
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  className = "",
  floatLabelType = "Auto",
}: SyncfusionInputProps) {
  useEffect(() => {
    registerSyncfusionLicense()
  }, [])

  return (
    <TextBoxComponent
      placeholder={placeholder}
      value={value}
      change={onChange}
      type={type}
      disabled={disabled}
   
      cssClass={className}
      floatLabelType={floatLabelType}
    />
  )
}
