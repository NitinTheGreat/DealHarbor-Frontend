"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/components/ClientAuth"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
	const { user, isLoading, logout } = useAuth()

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-sm text-muted-foreground">Loading your profile…</p>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
					<h1 className="text-xl font-semibold">Not signed in</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Please log in to view your profile.
					</p>
					<div className="mt-6 flex gap-3">
						<Button asChild variant="default">
							<Link href="/login">Go to login</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/">Back home</Link>
						</Button>
					</div>
				</div>
			</div>
		)
	}

	const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
	const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
	const verifiedStudent = Boolean((user as any)?.verifiedStudent)
	const sellerBadge = (user as any)?.sellerBadge as string | undefined

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-2xl px-4 py-10">
				<div className="rounded-xl border bg-white p-6 shadow-sm">
					<div className="flex items-center gap-4">
						{user.profilePhotoUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={user.profilePhotoUrl}
								alt={fullName || user.email}
								className="h-16 w-16 rounded-full object-cover border"
							/>
						) : (
							<div className="h-16 w-16 rounded-full bg-accent text-accent-foreground grid place-items-center border text-lg font-semibold">
								{initials}
							</div>
						)}

						<div className="flex-1">
							<h1 className="text-2xl font-semibold leading-tight">{fullName || user.email}</h1>
							<p className="text-sm text-muted-foreground">{user.email}</p>
			<div className="flex items-center gap-2">
			  <span
				className={`rounded-full px-2.5 py-1 text-xs font-medium ${verifiedStudent ? "bg-green-100 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
			  >
				{verifiedStudent ? "Student Verified" : "Not Verified"}
			  </span>

			  {sellerBadge && (
				<span className="rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
				  {sellerBadge
					.toString()
					.split("_")
					.map((w) => w.charAt(0) + w.slice(1).toLowerCase())
					.join(" ")}
				</span>
			  )}
			</div>
              )}
            </div>
					</div>

					<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="rounded-lg border bg-background p-4">
							<p className="text-xs text-muted-foreground">First name</p>
							<p className="mt-1 font-medium">{user.firstName || "—"}</p>
						</div>
						<div className="rounded-lg border bg-background p-4">
							<p className="text-xs text-muted-foreground">Last name</p>
							<p className="mt-1 font-medium">{user.lastName || "—"}</p>
						</div>
						<div className="rounded-lg border bg-background p-4">
							<p className="text-xs text-muted-foreground">Role</p>
							<p className="mt-1 font-medium capitalize">{user.role || "—"}</p>
						</div>
						<div className="rounded-lg border bg-background p-4">
							<p className="text-xs text-muted-foreground">User ID</p>
							<p className="mt-1 font-mono text-sm">{user.id || "—"}</p>
						</div>
					</div>

					<div className="mt-6 flex flex-wrap gap-3">
						<Button onClick={logout} variant="outline">
							Log out
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

