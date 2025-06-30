// components/ui/terms-modal.tsx
"use client"

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-heading)",
              }}
            >
              Terms & Conditions
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 text-sm" style={{ color: "var(--color-text)" }}>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-heading)" }}>
                Welcome to DealHarbor
              </h3>
              <p>
                DealHarbor is VIT's exclusive student marketplace - think of it as "OLX for VIT students." Our platform
                connects VIT students for safe, secure, and convenient buying and selling within the campus community.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-heading)" }}>
                Eligibility
              </h3>
              <p>
                • Only VIT students with valid @vitstudent.ac.in or @vit.ac.in email addresses can use DealHarbor
                <br />• You must verify your student status to access full platform features
                <br />• All transactions are between VIT students only
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-heading)" }}>
                Platform Rules
              </h3>
              <p>
                • List only genuine items with accurate descriptions and photos
                <br />• No prohibited items (alcohol, drugs, weapons, etc.)
                <br />• Respect other users and maintain professional communication
                <br />• Report suspicious activities or fake listings immediately
                <br />• Complete transactions in safe, public campus locations
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-heading)" }}>
                Data Security
              </h3>
              <p>
                Our Spring Boot backend ensures enterprise-grade security for your personal information. We use
                encrypted connections, secure authentication, and follow industry best practices to protect your data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-heading)" }}>
                Liability
              </h3>
              <p>
                DealHarbor facilitates connections between students but is not responsible for transaction disputes,
                item quality, or delivery issues. Users transact at their own discretion and risk.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-heading)" }}>
                Account Termination
              </h3>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent
                activities, or compromise platform safety.
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-xs" style={{ color: "var(--color-subheading)" }}>
                By using DealHarbor, you agree to these terms and our commitment to creating a safe, trusted marketplace
                for the VIT community. Last updated: January 2024
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-2 px-4 rounded-md text-white font-semibold transition-colors hover:opacity-90"
              style={{
                backgroundColor: "var(--color-button)",
                fontFamily: "var(--font-button)",
              }}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
