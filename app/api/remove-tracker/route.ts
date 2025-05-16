import { NextResponse } from "next/server"
import type { MVPTracker } from "@/types/mvp"

// Referencia al almacenamiento del servidor
let serverTrackers: MVPTracker[] = []

// Importar la referencia al almacenamiento del servidor
import { serverTrackers as trackerRef } from "@/app/api/trackers/route"

// Asignar la referencia
serverTrackers = trackerRef

export async function POST(req: Request) {
  try {
    const { mvpId, guildId, channelId, locationIndex = 0 } = await req.json()

    console.log(
      `Procesando solicitud para eliminar tracker: MVP ID ${mvpId}, Guild ${guildId}, Location ${locationIndex}`,
    )

    // Encontrar el índice del tracker que queremos eliminar
    const trackerIndex = serverTrackers.findIndex(
      (t) =>
        t.mvpId === mvpId && t.guildId === guildId && t.channelId === channelId && t.locationIndex === locationIndex,
    )

    // Si no encontramos el tracker, retornar error
    if (trackerIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracker no encontrado",
        },
        { status: 404 },
      )
    }

    // Eliminar el tracker del array
    serverTrackers.splice(trackerIndex, 1)

    console.log(`Tracker eliminado. Quedan ${serverTrackers.length} trackers.`)

    return NextResponse.json({
      success: true,
      message: "Tracker eliminado correctamente",
    })
  } catch (error) {
    console.error("Error eliminando tracker:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
