import { NextResponse } from "next/server"
import { getMVPByName, getMVPById, getLocationRespawnTime } from "@/lib/mvp-service"
import type { MVPTracker } from "@/types/mvp"

// Referencia al almacenamiento del servidor
let serverTrackers: MVPTracker[] = []

// Importar la referencia al almacenamiento del servidor
import { serverTrackers as trackerRef } from "@/app/api/trackers/route"

// Asignar la referencia
serverTrackers = trackerRef

export async function POST(req: Request) {
  try {
    const { mvpId, mvpName, guildId, channelId, locationIndex = 0, killer } = await req.json()

    console.log(`Procesando solicitud de rastreo para MVP`)

    let mvp

    // Buscar por ID o por nombre
    if (mvpId) {
      mvp = getMVPById(mvpId)
    } else if (mvpName) {
      mvp = getMVPByName(mvpName)
    }

    if (!mvp) {
      return NextResponse.json({ success: false, error: "MVP no encontrado" }, { status: 404 })
    }

    // Verificar que el índice de ubicación sea válido
    if (locationIndex < 0 || locationIndex >= mvp.locations.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Índice de ubicación inválido: ${locationIndex}`,
        },
        { status: 400 },
      )
    }

    // Obtener el tiempo de respawn específico para esta ubicación
    const respawnTime = getLocationRespawnTime(mvp, locationIndex)

    // Crear el tracker
    const now = new Date()
    const expectedRespawn = new Date(now.getTime() + respawnTime * 60 * 1000)

    const tracker: MVPTracker = {
      mvpId: mvp.id,
      guildId: guildId || "web-interface",
      channelId: channelId || "dashboard",
      lastKilled: now,
      expectedRespawn,
      killedBy: killer || "Unknown",
      locationIndex,
    }

    // Verificar si ya existe este tracker
    const existingIndex = serverTrackers.findIndex(
      (t) =>
        t.mvpId === mvp.id &&
        t.guildId === tracker.guildId &&
        t.channelId === tracker.channelId &&
        t.locationIndex === locationIndex,
    )

    if (existingIndex >= 0) {
      serverTrackers[existingIndex] = tracker
    } else {
      serverTrackers.push(tracker)
    }

    console.log(`MVP ${mvp.name} tracked successfully. Total trackers: ${serverTrackers.length}`)

    return NextResponse.json({
      success: true,
      mvp: mvp.name,
      respawnTime,
      expectedRespawn: tracker.expectedRespawn,
    })
  } catch (error) {
    console.error("Error procesando solicitud de rastreo:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
