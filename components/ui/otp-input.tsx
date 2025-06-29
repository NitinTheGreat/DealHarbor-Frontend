// components/ui/otp-input.tsx
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

export function OTPInput({ length = 6, value, onChange, disabled = false, autoFocus = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Update internal state when value prop changes
  useEffect(() => {
    const otpArray = value.split("").slice(0, length)
    const paddedArray = [...otpArray, ...new Array(length - otpArray.length).fill("")]
    setOtp(paddedArray)
  }, [value, length])

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (disabled) return

    const val = element.value
    if (isNaN(Number(val))) return

    const newOtp = [...otp]
    newOtp[index] = val.substring(val.length - 1)
    setOtp(newOtp)

    const otpValue = newOtp.join("")
    onChange(otpValue)

    // Focus next input
    if (val && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (disabled) return

    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault()
      const newOtp = [...otp]

      if (otp[index]) {
        // Clear current box
        newOtp[index] = ""
      } else if (index > 0) {
        // Move to previous box and clear it
        newOtp[index - 1] = ""
        inputRefs.current[index - 1]?.focus()
      }

      setOtp(newOtp)
      onChange(newOtp.join(""))
    }

    // Handle arrow keys
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Handle paste
    else if (e.key === "Enter") {
      e.preventDefault()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return

    e.preventDefault()
    const pasteData = e.clipboardData.getData("text/plain")
    const pasteArray = pasteData
      .split("")
      .filter((char) => !isNaN(Number(char)))
      .slice(0, length)

    const newOtp = [...new Array(length).fill("")]
    pasteArray.forEach((char, index) => {
      newOtp[index] = char
    })

    setOtp(newOtp)
    onChange(newOtp.join(""))

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pasteArray.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleFocus = (index: number) => {
    // Select all text when focusing
    inputRefs.current[index]?.select()
  }

  return (
    <div className="flex gap-3 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-xl font-bold border-2 rounded-xl
            transition-all duration-200 
            ${digit ? "border-green-400 bg-green-50" : "border-gray-300"}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:border-gray-400"}
            focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent
            disabled:opacity-50
          `}
          style={
            {
              fontFamily: "var(--font-body)",
              "--tw-ring-color": "var(--color-button)",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
