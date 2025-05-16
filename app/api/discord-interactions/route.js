import { NextResponse } from "next/server"
import { verifyKey } from "discord-interactions"

export async function POST(req) {
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

    const isValidRequest = verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY)

    if (!isValidRequest) {
      console.error("Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Parse the request body
    const interaction = JSON.parse(body)

    // Handle PING interaction (type 1)
    if (interaction.type === 1) {
      console.log("Responding to PING with PONG")
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
    return NextResponse.json({ type: 1 }) // Always respond with PONG on error
  }
}

export async function GET(req) {
  return NextResponse.json({
    message: "This endpoint is for Discord interactions. Please use POST requests.",
    timestamp: new Date().toISOString(),
  })
}
