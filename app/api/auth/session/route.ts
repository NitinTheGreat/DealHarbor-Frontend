// app/api/auth/session/route.ts
// This route establishes a frontend session after OAuth by setting a cookie
// that the middleware can read for server-side auth verification

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = "https://yqstbpypmm.ap-south-1.awsapprunner.com"

export async function POST(req: NextRequest) {
    try {
        // Get the session ID from the backend cookie that was just set
        const backendCookies = req.headers.get("cookie") || ""

        console.log("/api/auth/session - Received cookies:", backendCookies)

        // Call the backend to verify the session and get user data
        // The browser should have the backend's session cookie from the OAuth flow
        const verifyRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Cookie: backendCookies,
            },
            cache: "no-store",
        })

        if (!verifyRes.ok) {
            console.error("/api/auth/session - Backend verification failed:", verifyRes.status)
            return NextResponse.json(
                { success: false, error: "Session verification failed" },
                { status: 401 }
            )
        }

        const user = await verifyRes.json()
        console.log("/api/auth/session - User verified:", user.email)

        // Extract the backend session cookie to forward to frontend
        const setCookieHeader = verifyRes.headers.get("set-cookie")

        // Create response with success
        const response = NextResponse.json({
            success: true,
            user,
        })

        // Copy the JSESSIONID from the request and set it on the frontend domain
        // This allows the middleware to forward it to the backend
        const jsessionMatch = backendCookies.match(/JSESSIONID=([^;]+)/)
        if (jsessionMatch) {
            // Set a cookie that mirrors the backend session
            response.cookies.set("BACKEND_SESSION", jsessionMatch[1], {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
            console.log("/api/auth/session - Set BACKEND_SESSION cookie")
        }

        // Also forward any set-cookie from the backend
        if (setCookieHeader) {
            response.headers.set("Set-Cookie", setCookieHeader)
        }

        return response
    } catch (error) {
        console.error("/api/auth/session - Error:", error)
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest) {
    // Clear the frontend session cookie on logout
    const response = NextResponse.json({ success: true })
    response.cookies.delete("BACKEND_SESSION")
    return response
}
