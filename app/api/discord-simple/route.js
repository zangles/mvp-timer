import { NextResponse } from "next/server"

// Discord interaction types
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
}

export async function POST(req) {
  try {
    // Get the signature and timestamp from the headers
    const signature = req.headers.get("x-signature-ed25519")
    const timestamp = req.headers.get("x-signature-timestamp")

    // Get the raw body
    const body = await req.text()

    console.log("SIMPLE ENDPOINT - Request received")
    console.log("Signature:", signature ? "present" : "missing")
    console.log("Timestamp:", timestamp ? "present" : "missing")
    console.log("Body length:", body.length)

    // For PING requests, always respond with PONG
    try {
      const interaction = JSON.parse(body)
      if (interaction.type === 1) {
        console.log("Responding to PING with PONG")
        return NextResponse.json({ type: 1 })
      }

      // For any other interaction, respond with a simple message
      return NextResponse.json({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: "Command received! The bot is working.",
        },
      })
    } catch (parseError) {
      console.error("Error parsing interaction:", parseError)
      // Still respond with PONG for safety
      return NextResponse.json({ type: 1 })
    }
  } catch (error) {
    console.error("Error in simple endpoint:", error)
    // Still respond with PONG even if there's an error
    return NextResponse.json({ type: 1 })
  }
}

export async function GET(req) {
  return NextResponse.json({
    message: "This is a simple endpoint for Discord interactions.",
    timestamp: new Date().toISOString(),
  })
}
