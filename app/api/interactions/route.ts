import { NextResponse } from "next/server"
import { verifyKey } from "discord-interactions"
import { getMVPByName } from "@/lib/mvp-service"

// Discord interaction types
enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

// Discord interaction response types
enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  MODAL = 9,
}

export async function POST(req: Request) {
  try {
    // Get the signature and timestamp from the headers
    const signature = req.headers.get("x-signature-ed25519")
    const timestamp = req.headers.get("x-signature-timestamp")

    // Get the raw body
    const body = await req.text()

    console.log("Received Discord interaction request:", {
      signature: signature ? "present" : "missing",
      timestamp: timestamp ? "present" : "missing",
      bodyLength: body.length,
    })

    // Verify the request is coming from Discord
    if (!signature || !timestamp || !process.env.DISCORD_PUBLIC_KEY) {
      console.error("Missing required headers or environment variables")
      return NextResponse.json({ error: "Missing required headers or environment variables" }, { status: 401 })
    }

    const isValid = verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY)

    if (!isValid) {
      console.error("Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Parse the request body
    const interaction = JSON.parse(body)
    console.log("Interaction type:", interaction.type)

    // Handle the interaction
    switch (interaction.type) {
      case InteractionType.PING:
        console.log("Responding to PING with PONG")
        return NextResponse.json({ type: InteractionResponseType.PONG })

      case InteractionType.APPLICATION_COMMAND:
        // Handle slash commands
        const { name } = interaction.data
        console.log("Command received:", name)

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
                      name: "/track [name] [killer]",
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

          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: [
                {
                  title: `${mvp.name} (Lv. ${mvp.level})`,
                  description: "A powerful MVP boss from Ragnarok Online.",
                  color: 0x0099ff,
                  fields: [
                    { name: "HP", value: mvp.hp.toLocaleString(), inline: true },
                    { name: "Base EXP", value: mvp.exp.toLocaleString(), inline: true },
                    { name: "Respawn Time", value: `${mvp.respawnTime} minutes`, inline: true },
                    {
                      name: "Locations",
                      value: mvp.locations.map((loc) => `${loc.map} (${loc.x}, ${loc.y})`).join("\n"),
                    },
                    {
                      name: "Notable Drops",
                      value: mvp.drops.map((drop) => `${drop.name} (${drop.chance}%)`).join("\n"),
                    },
                  ],
                  thumbnail: mvp.imageUrl ? { url: mvp.imageUrl } : null,
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
  } catch (error) {
    console.error("Error processing Discord interaction:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// Add OPTIONS method to handle preflight requests
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Signature-Ed25519, X-Signature-Timestamp",
    },
  })
}

// Add GET method for testing
export async function GET(req: Request) {
  return NextResponse.json({
    message: "This endpoint is for Discord interactions. Please use POST requests.",
    timestamp: new Date().toISOString(),
  })
}
