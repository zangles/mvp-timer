import { NextResponse } from "next/server"
import type { MVPTracker } from "@/types/mvp"

// Referencia al almacenamiento del servidor
let serverTrackers: MVPTracker[] = []

// Importar la referencia al almacenamiento del servidor
import { serverTrackers as trackerRef } from "@/app/api/trackers/route"

// Asignar la referencia
serverTrackers = trackerRef

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const guildId = url.searchParams.get("guildId") || "web-interface"

    // Filtrar por guildId
    const trackers = serverTrackers.filter((tracker) => tracker.guildId === guildId)

    // Convertir las fechas a strings para la respuesta JSON
    const trackersForResponse = trackers.map((tracker) => ({
      ...tracker,
      lastKilled: new Date(tracker.lastKilled).toISOString(),
      expectedRespawn: new Date(tracker.expectedRespawn).toISOString(),
    }))

    return NextResponse.json({
      success: true,
      trackers: trackersForResponse,
    })
  } catch (error) {
    console.error("Error obteniendo MVPs rastreados:", error)
    return NextResponse.json({ success: false, error: "Error al obtener MVPs rastreados" }, { status: 500 })
  }
}
