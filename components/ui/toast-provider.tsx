// components/ui/toast-provider.tsx
"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--color-white)",
          color: "var(--color-text)",
          border: "1px solid #e5e7eb",
          fontFamily: "var(--font-body)",
        },
      }}
      theme="light"
      richColors
    />
  )
}
