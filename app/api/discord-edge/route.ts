import { NextResponse } from "next/server"

// Use Edge Runtime
export const runtime = "edge"

export async function POST(req: Request) {
  try {
    // Get the raw body
    const body = await req.text()

    // Parse the request body
    const interaction = JSON.parse(body)

    // Handle PING interaction (type 1)
    if (interaction.type === 1) {
      return NextResponse.json({ type: 1 })
    }

    // For any other interaction, respond with a simple message
    return NextResponse.json({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content: "Command received from edge function!",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return NextResponse.json({
    message: "This is an edge function for Discord interactions. Please use POST requests.",
    timestamp: new Date().toISOString(),
  })
}
