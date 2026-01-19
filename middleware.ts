import { NextRequest, NextResponse } from "next/server"

// Paths that require authentication and student verification
// Note: /verify-student is included to require login but will allow access even if not verified
export const config = {
  matcher: [
    "/products/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/verify-student",
  ],
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Allow OAuth redirect page without authentication check
  if (pathname.startsWith("/oauth2/redirect")) {
    return NextResponse.next()
  }

  try {
    // Call backend directly to avoid any same-origin/mode pitfalls
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    const cookieHeader = req.headers.get("cookie") || ""

    // Check for JWT token in cookies (set by OAuth flow)
    const authToken = req.cookies.get("dealharbor_auth_token")?.value

    // Build headers for backend request
    const headers: HeadersInit = {
      accept: "application/json",
      "cache-control": "no-cache, no-store, must-revalidate",
      "pragma": "no-cache",
      "expires": "0",
    }

    // Forward browser cookies (JSESSIONID should be present on localhost domain)
    if (cookieHeader) {
      headers["cookie"] = cookieHeader
    }

    // Include JWT token in Authorization header if available
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }

    const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    // Not authenticated -> send to login with returnTo
    if (!meRes.ok) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("returnTo", pathname + (search || ""))
      return NextResponse.redirect(loginUrl)
    }

    const user = (await meRes.json()) as any

    // Be tolerant to different backend field names
    const isStudentVerified = Boolean(
      user?.isStudentVerified ??
      user?.isVerifiedStudent ??
      user?.studentVerified ??
      user?.verifiedStudent
    )

    // If user is not student verified and not on the verification page -> redirect to verify-student
    if (!isStudentVerified && pathname !== "/verify-student") {
      const verifyUrl = new URL("/verify-student", req.url)
      verifyUrl.searchParams.set("returnTo", pathname + (search || ""))
      return NextResponse.redirect(verifyUrl)
    }

    // If already verified and trying to access verification page, optionally redirect away
    if (isStudentVerified && pathname === "/verify-student") {
      const redirectUrl = new URL("/products", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // All good, continue
    return NextResponse.next()
  } catch (error) {
    // On error, be safe and send to login
    console.error("Middleware auth error:", error)
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("returnTo", pathname + (search || ""))
    return NextResponse.redirect(loginUrl)
  }
}
