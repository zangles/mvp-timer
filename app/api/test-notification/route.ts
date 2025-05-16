import { NextResponse } from "next/server"
import { getMVPById } from "@/lib/mvp-service"

export async function POST(req: Request) {
  try {
    const { mvpId, guildId, channelId, locationIndex = 0 } = await req.json()

    // Verificar que tenemos los datos necesarios
    if (!mvpId || !guildId || !channelId) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos",
        },
        { status: 400 },
      )
    }

    // Verificar que tenemos el token de Discord
    if (!process.env.DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "Falta el token de Discord en las variables de entorno",
        },
        { status: 500 },
      )
    }

    // Obtener el MVP
    const mvp = getMVPById(mvpId)
    if (!mvp) {
      return NextResponse.json(
        {
          success: false,
          error: "MVP no encontrado",
        },
        { status: 404 },
      )
    }

    // Verificar que el índice de ubicación sea válido
    if (locationIndex < 0 || locationIndex >= mvp.locations.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Índice de ubicación inválido",
        },
        { status: 400 },
      )
    }

    const location = mvp.locations[locationIndex]

    // Crear el mensaje de notificación
    const embed = {
      title: `${mvp.name} Respawn Alert! (TEST)`,
      color: 0xff0000,
      description: `**${mvp.name}** is respawning now! (This is a test notification)`,
      fields: [
        {
          name: "Location",
          value: `${location.map} (${location.x}, ${location.y})`,
          inline: true,
        },
        {
          name: "Respawn Time",
          value: `${location.respawnTime || mvp.respawnTime} minutes`,
          inline: true,
        },
      ],
      thumbnail: mvp.imageUrl ? { url: mvp.imageUrl } : null,
      footer: {
        text: "This is a test notification",
      },
    }

    // Enviar la notificación usando Discord's REST API
    const url = `https://discord.com/api/v10/channels/${channelId}/messages`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        content: `@here TEST NOTIFICATION: ${mvp.name} is respawning now!`,
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: `Error enviando notificación: ${errorText}`,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Notificación de prueba enviada correctamente",
    })
  } catch (error) {
    console.error("Error enviando notificación de prueba:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
