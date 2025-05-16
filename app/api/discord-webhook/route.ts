import { NextResponse } from "next/server"

// Discord interaction types
enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
}

// Discord interaction response types
enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
}

export async function POST(req: Request) {
  try {
    console.log("Discord webhook received a POST request")

    // Get the raw body
    const body = await req.text()
    console.log("Request body:", body)

    // Parse the request body
    const interaction = JSON.parse(body)
    console.log("Parsed interaction type:", interaction.type)

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

        // Default response for unknown commands
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Command received!",
          },
        })

      default:
        console.log("Unknown interaction type:", interaction.type)
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Unknown interaction type.",
          },
        })
    }
  } catch (error) {
    console.error("Error processing Discord interaction:", error)
    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "An error occurred while processing your request.",
      },
    })
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

// Add GET method to handle browser requests (for testing only)
export async function GET(req: Request) {
  return NextResponse.json({
    message: "This endpoint is for Discord interactions. Please use POST requests.",
    timestamp: new Date().toISOString(),
  })
}
