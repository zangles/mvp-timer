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
    console.log("Discord endpoint received a POST request")

    // Get the raw body
    const body = await req.text()
    console.log("Request body:", body)

    // Parse the request body
    const interaction = JSON.parse(body)
    console.log("Parsed interaction type:", interaction.type)

    // Handle PING interaction (type 1)
    if (interaction.type === 1) {
      console.log("Responding with PONG")
      return NextResponse.json({ type: 1 })
    }

    // For any other interaction, respond with a simple message
    return NextResponse.json({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content: "Command received!",
      },
    })
  } catch (error) {
    console.error("Error processing Discord interaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
