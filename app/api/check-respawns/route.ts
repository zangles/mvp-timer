import { NextResponse } from "next/server"
import { checkAndSendNotifications } from "@/lib/notification-service"

// This route will be called by a scheduled job (e.g., cron job)
export async function GET() {
  try {
    // Check for respawns and send notifications
    await checkAndSendNotifications()

    return NextResponse.json({ success: true, message: "Respawn check completed" })
  } catch (error) {
    console.error("Error checking respawns:", error)
    return NextResponse.json({ error: "Failed to check respawns", details: error.message }, { status: 500 })
  }
}
