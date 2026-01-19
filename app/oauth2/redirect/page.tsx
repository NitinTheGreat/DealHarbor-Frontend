// app/oauth2/redirect/page.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useAuth } from "@/components/ClientAuth"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

function OAuthRedirectContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { checkAuthStatus, user } = useAuth()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("Processing authentication...")
    const hasProcessed = useRef(false)

    // If user logs out while on this page, redirect to login
    useEffect(() => {
        if (hasProcessed.current && user === null && status !== "loading") {
            router.push("/login")
        }
    }, [user, status, router])

    useEffect(() => {
        // Prevent running multiple times
        if (hasProcessed.current) return
        hasProcessed.current = true

        const handleOAuthCallback = async () => {
            try {
                // Check URL params for OAuth result
                const oauthSuccess = searchParams.get("oauth") === "success"
                const error = searchParams.get("error")

                console.log("OAuth Redirect: Received params", {
                    oauthSuccess,
                    error,
                    fullUrl: window.location.href
                })

                // Handle error from OAuth provider
                if (error) {
                    setStatus("error")
                    setMessage(`Authentication failed: ${decodeURIComponent(error)}`)
                    setTimeout(() => router.push("/login"), 3000)
                    return
                }

                // If no success param, something went wrong
                if (!oauthSuccess) {
                    setStatus("error")
                    setMessage("OAuth authentication was not completed. Please try again.")
                    setTimeout(() => router.push("/login"), 3000)
                    return
                }

                setMessage("Setting up your session...")

                // Wait 3 seconds for session to fully establish (same as email/password auth)
                await new Promise(resolve => setTimeout(resolve, 3000))

                setMessage("Verifying your account...")

                // Session-based auth: call /api/auth/me with credentials to verify session cookie
                const user = await checkAuthStatus()

                if (user) {
                    setStatus("success")

                    // Check if user needs to verify student status (same flow as email/password auth)
                    if (!user.isStudentVerified) {
                        setMessage(`Welcome${user.firstName ? `, ${user.firstName}` : ""}! Redirecting to student verification...`)
                        setTimeout(() => {
                            router.push("/verify-student")
                        }, 1500)
                    } else {
                        setMessage(`Welcome back${user.firstName ? `, ${user.firstName}` : ""}! Redirecting...`)
                        setTimeout(() => {
                            router.push("/products")
                        }, 1500)
                    }
                } else {
                    setStatus("error")
                    setMessage("Failed to verify your session. Please try again.")
                    setTimeout(() => router.push("/login"), 3000)
                }
            } catch (err) {
                console.error("OAuth callback error:", err)
                setStatus("error")
                setMessage("An unexpected error occurred. Please try again.")
                setTimeout(() => router.push("/login"), 3000)
            }
        }

        handleOAuthCallback()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-button/20 via-button-hover/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-button-hover/15 via-button/10 to-transparent rounded-full blur-2xl"></div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-2xl"></div>

                <div className="relative z-10">
                    {/* Status Icon */}
                    <div className="mb-6">
                        {status === "loading" && (
                            <div className="mx-auto w-16 h-16 flex items-center justify-center">
                                <Loader2 className="w-12 h-12 text-button animate-spin" />
                            </div>
                        )}
                        {status === "success" && (
                            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                        )}
                        {status === "error" && (
                            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-heading text-heading mb-2">
                        {status === "loading" && "Signing you in..."}
                        {status === "success" && "Success!"}
                        {status === "error" && "Authentication Failed"}
                    </h1>

                    {/* Message */}
                    <p className="text-subheading font-body">{message}</p>

                    {/* Back to login link for errors */}
                    {status === "error" && (
                        <button
                            onClick={() => router.push("/login")}
                            className="mt-6 text-link font-link font-medium hover:text-button transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
                        >
                            Back to Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function OAuthRedirectPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-button animate-spin" />
                </div>
            }
        >
            <OAuthRedirectContent />
        </Suspense>
    )
}
