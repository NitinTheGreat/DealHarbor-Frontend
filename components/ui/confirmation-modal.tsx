// components/ui/confirmation-modal.tsx
"use client"

import { AlertCircle, CheckCircle, X } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "success" | "info"
  icon?: React.ReactNode
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  icon,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const getTypeColor = () => {
    switch (type) {
      case "danger":
        return "from-red-600 to-red-700"
      case "success":
        return "from-green-600 to-green-700"
      case "info":
        return "from-blue-600 to-blue-700"
      case "warning":
      default:
        return "from-orange-600 to-orange-700"
    }
  }

  const getIcon = () => {
    if (icon) return icon
    switch (type) {
      case "danger":
        return <AlertCircle className="w-12 h-12 text-red-600" />
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-600" />
      case "warning":
        return <AlertCircle className="w-12 h-12 text-orange-600" />
      case "info":
      default:
        return <AlertCircle className="w-12 h-12 text-blue-600" />
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-white/20 animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">{getIcon()}</div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`flex-1 px-4 py-2.5 bg-gradient-to-r ${getTypeColor()} text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
