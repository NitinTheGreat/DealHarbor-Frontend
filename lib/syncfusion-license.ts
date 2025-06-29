// lib/syncfusion-license.ts
import { registerLicense } from "@syncfusion/ej2-base"

// Register your Syncfusion license key
export function registerSyncfusionLicense() {
  // Replace with your actual license key from Syncfusion dashboard
  const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY || "YOUR_LICENSE_KEY_HERE"
  registerLicense(licenseKey)
}
