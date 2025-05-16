import { NextResponse } from "next/server"
import type { MVPTracker } from "@/types/mvp"

// Almacenamiento en memoria para el servidor
export let serverTrackers: MVPTracker[] = []

export async function GET() {
  try {
    // Convertir las fechas a strings para la respuesta JSON
    const trackersForResponse = serverTrackers.map((tracker) => ({
      ...tracker,
      lastKilled: new Date(tracker.lastKilled).toISOString(),
      expectedRespawn: new Date(tracker.expectedRespawn).toISOString(),
    }))

    return NextResponse.json({
      success: true,
      trackers: trackersForResponse,
    })
  } catch (error) {
    console.error("Error getting trackers:", error)
    return NextResponse.json({ success: false, error: "Error getting trackers" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { trackers } = await req.json()

    // Validar que trackers sea un array
    if (!Array.isArray(trackers)) {
      return NextResponse.json({ success: false, error: "Invalid trackers data" }, { status: 400 })
    }

    // Convertir las fechas de string a Date
    serverTrackers = trackers.map((tracker) => ({
      ...tracker,
      lastKilled: new Date(tracker.lastKilled),
      expectedRespawn: new Date(tracker.expectedRespawn),
    }))

    console.log(`Saved ${serverTrackers.length} trackers to server memory cache`)

    return NextResponse.json({
      success: true,
      message: "Trackers saved successfully",
    })
  } catch (error) {
    console.error("Error saving trackers:", error)
    return NextResponse.json({ success: false, error: "Error saving trackers" }, { status: 500 })
  }
}
