import { NextResponse } from "next/server"
import crypto from "crypto"
import { getMVPByName, getMVPById, formatRespawnTime, getLocationRespawnTime, formatLocation } from "@/lib/mvp-service"

// Asegurarnos de que estamos usando la misma referencia al almacenamiento del servidor
import { serverTrackers as trackerRef } from "@/app/api/trackers/route"

// Asignar la referencia al inicio del archivo
const serverTrackers = trackerRef

// Discord interaction types
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
}

// Discord interaction response types
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
  MODAL: 9,
}

export async function POST(req) {
  try {
    // Get the signature and timestamp from the headers
    const signature = req.headers.get("x-signature-ed25519")
    const timestamp = req.headers.get("x-signature-timestamp")

    // Get the raw body
    const body = await req.text()

    console.log("FIXED VERIFICATION - Request received")

    // Check if we have all the required data
    if (!signature || !timestamp || !process.env.DISCORD_PUBLIC_KEY) {
      console.log("Missing required data for verification")
      return NextResponse.json({ error: "Missing required data" }, { status: 401 })
    }

    try {
      // Create the message that was signed (timestamp + body)
      const message = timestamp + body

      // Verify the signature
      const publicKey = process.env.DISCORD_PUBLIC_KEY
      const isValid = await verifyDiscordRequest(message, signature, publicKey)

      if (!isValid) {
        console.log("Invalid signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }

      // Parse the request body
      const interaction = JSON.parse(body)
      console.log("Interaction type:", interaction.type, "Command:", interaction.data?.name)

      // Handle the interaction
      switch (interaction.type) {
        case InteractionType.PING:
          console.log("Responding to PING with PONG")
          return NextResponse.json({ type: InteractionResponseType.PONG })

        case InteractionType.APPLICATION_COMMAND:
          // Handle slash commands
          const { name } = interaction.data

          // Special handling for track command
          if (name === "track") {
            const mvpName = interaction.data.options.find((opt) => opt.name === "name")?.value
            console.log(`Track command received for MVP: ${mvpName}`)

            // Check if MVP exists first
            const mvp = getMVPByName(mvpName)
            if (!mvp) {
              console.log(`MVP "${mvpName}" not found`)
              return NextResponse.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `MVP "${mvpName}" not found.`,
                  flags: 64, // Ephemeral flag
                },
              })
            }

            // Get additional parameters
            const killer =
              interaction.data.options.find((opt) => opt.name === "killer")?.value || interaction.member.user.username
            const locationIndex = interaction.data.options.find((opt) => opt.name === "location")?.value || 0
            const guildId = interaction.guild_id
            const channelId = interaction.channel_id

            // Verificar que el índice de ubicación sea válido
            if (locationIndex < 0 || locationIndex >= mvp.locations.length) {
              return NextResponse.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `Índice de ubicación inválido: ${locationIndex}. El MVP ${mvp.name} tiene ${mvp.locations.length} ubicaciones (0-${mvp.locations.length - 1}).`,
                  flags: 64, // Ephemeral flag
                },
              })
            }

            // Obtener el tiempo de respawn específico para esta ubicación
            const respawnTime = getLocationRespawnTime(mvp, locationIndex)
            const location = mvp.locations[locationIndex]

            // Track the MVP
            console.log(
              `Tracking MVP ${mvp.name} (ID: ${mvp.id}) in guild ${guildId}, channel ${channelId}, location ${locationIndex}, killed by ${killer}`,
            )
            try {
              // Crear el tracker
              const now = new Date()
              const expectedRespawn = new Date(now.getTime() + respawnTime * 60 * 1000)

              const tracker = {
                mvpId: mvp.id,
                guildId,
                channelId,
                lastKilled: now,
                expectedRespawn,
                killedBy: killer,
                locationIndex,
              }

              // Verificar si ya existe este tracker
              const existingIndex = serverTrackers.findIndex(
                (t) =>
                  t.mvpId === mvp.id &&
                  t.guildId === guildId &&
                  t.channelId === channelId &&
                  t.locationIndex === locationIndex,
              )

              if (existingIndex >= 0) {
                serverTrackers[existingIndex] = tracker
              } else {
                serverTrackers.push(tracker)
              }

              console.log(`MVP tracked successfully. Total trackers: ${serverTrackers.length}`)

              // For valid MVPs, use a minimal response
              return NextResponse.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `Tracking ${mvp.name} en ${formatLocation(location)}. Respawneará en ${respawnTime} minutos.`,
                },
              })
            } catch (trackError) {
              console.error("Error tracking MVP:", trackError)
              return NextResponse.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `Error tracking MVP: ${trackError.message}`,
                  flags: 64, // Ephemeral flag
                },
              })
            }
          }

          if (name === "ping") {
            return NextResponse.json({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: "Pong! Bot is online.",
              },
            })
          }

          if (name === "help") {
            return NextResponse.json({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                embeds: [
                  {
                    title: "Sprinkles - Ragnarok MVP Helper",
                    description: "A Discord bot to help track MVPs in Ragnarok Online",
                    color: 0x0099ff,
                    fields: [
                      {
                        name: "/mvp [name]",
                        value: "Get detailed information about an MVP boss",
                      },
                      {
                        name: "/track [name] [location] [killer]",
                        value: "Track an MVP kill to get notified when it respawns",
                      },
                      {
                        name: "/list",
                        value: "List all tracked MVPs in this server",
                      },
                      {
                        name: "/help",
                        value: "Shows this help message",
                      },
                    ],
                    footer: {
                      text: "Sprinkles v1.0.0",
                    },
                  },
                ],
              },
            })
          }

          if (name === "mvp") {
            const mvpName = interaction.data.options.find((opt) => opt.name === "name")?.value
            const mvp = getMVPByName(mvpName)

            if (!mvp) {
              return NextResponse.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `MVP "${mvpName}" not found.`,
                  flags: 64, // Ephemeral flag
                },
              })
            }

            // Crear campos para las ubicaciones
            const locationFields = mvp.locations.map((location, index) => {
              const respawnTime = location.respawnTime || mvp.respawnTime
              return {
                name: `Ubicación ${index + 1}`,
                value: `${formatLocation(location)}\nRespawn: ${respawnTime} minutos`,
                inline: true,
              }
            })

            return NextResponse.json({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                embeds: [
                  {
                    title: mvp.name,
                    description: "Un poderoso MVP de Ragnarok Online.",
                    color: 0x0099ff,
                    fields: [
                      { name: "Respawn predeterminado", value: `${mvp.respawnTime} minutos`, inline: true },
                      ...locationFields,
                    ],
                    thumbnail: mvp.imageUrl ? { url: mvp.imageUrl } : null,
                  },
                ],
              },
            })
          }

          if (name === "list") {
            const guildId = interaction.guild_id
            console.log(`List command received for guild: ${guildId}`)

            // Filtrar por guildId
            const trackers = serverTrackers.filter((tracker) => tracker.guildId === guildId)
            console.log(`Found ${trackers.length} trackers for guild ${guildId}`)

            if (trackers.length === 0) {
              return NextResponse.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: "No MVPs are currently being tracked in this server.",
                  flags: 64, // Ephemeral flag
                },
              })
            }

            const fields = []

            for (const tracker of trackers) {
              const mvp = getMVPById(tracker.mvpId)
              if (!mvp) continue

              const locationIndex = tracker.locationIndex !== undefined ? tracker.locationIndex : 0
              const location = mvp.locations[locationIndex]

              if (!location) continue

              const respawnTime = tracker.expectedRespawn
                ? formatRespawnTime(new Date(tracker.expectedRespawn))
                : "Unknown"

              fields.push({
                name: mvp.name,
                value: `Killed by: ${tracker.killedBy || "Unknown"}\nRespawn: ${respawnTime}\nUbicación: ${formatLocation(location)}`,
                inline: true,
              })
            }

            return NextResponse.json({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                embeds: [
                  {
                    title: "Tracked MVPs",
                    description: "List of MVPs being tracked in this server",
                    color: 0x0099ff,
                    fields,
                  },
                ],
              },
            })
          }

          // Default response for unknown commands
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "Command received! Full functionality coming soon.",
            },
          })

        default:
          console.log("Unknown interaction type:", interaction.type)
          return NextResponse.json(
            {
              error: "Unsupported interaction type",
            },
            { status: 400 },
          )
      }
    } catch (verifyError) {
      console.error("Verification error:", verifyError)
      return NextResponse.json({ error: "Verification error" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error in fixed verification endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to verify Discord requests
async function verifyDiscordRequest(message, signature, publicKey) {
  try {
    // Use the subtle crypto API which is more forgiving with key formats
    const encoder = new TextEncoder()
    const messageUint8 = encoder.encode(message)
    const signatureUint8 = hexToUint8Array(signature)
    const publicKeyUint8 = hexToUint8Array(publicKey)

    // Use the subtle crypto API to verify
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      publicKeyUint8,
      {
        name: "Ed25519",
        namedCurve: "Ed25519",
      },
      false,
      ["verify"],
    )

    const isValid = await crypto.subtle.verify("Ed25519", cryptoKey, signatureUint8, messageUint8)

    return isValid
  } catch (error) {
    console.error("Error in verifyDiscordRequest:", error)
    return false
  }
}

// Helper function to convert hex string to Uint8Array
function hexToUint8Array(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => Number.parseInt(byte, 16)))
}

export async function GET(req) {
  return NextResponse.json({
    message: "This is a fixed verification endpoint for Discord interactions.",
    timestamp: new Date().toISOString(),
  })
}
