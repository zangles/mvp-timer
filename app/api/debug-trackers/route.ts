import { NextResponse } from "next/server"
import { getTrackers, getMVPById } from "@/lib/mvp-service"

export async function GET(req: Request) {
  try {
    const trackers = await getTrackers()

    // Enriquecer los datos con información del MVP
    const enrichedTrackers = trackers.map((tracker) => {
      const mvp = getMVPById(tracker.mvpId)
      return {
        ...tracker,
        mvpName: mvp ? mvp.name : "Unknown MVP",
        respawnTimeMinutes: mvp ? mvp.respawnTime : "Unknown",
        lastKilled: new Date(tracker.lastKilled).toISOString(),
        expectedRespawn: new Date(tracker.expectedRespawn).toISOString(),
        timeUntilRespawn: new Date(tracker.expectedRespawn).getTime() - new Date().getTime(),
      }
    })

    return NextResponse.json({
      success: true,
      totalTrackers: trackers.length,
      trackers: enrichedTrackers,
      storageType: typeof window !== "undefined" ? "localStorage (client)" : "Memory Cache (server)",
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
