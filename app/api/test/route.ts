import { NextResponse } from "next/server"

export async function GET(req: Request) {
  return NextResponse.json({
    message: "Test endpoint is working correctly",
    timestamp: new Date().toISOString(),
    environment: {
      hasDiscordBotToken: !!process.env.DISCORD_BOT_TOKEN,
      hasDiscordClientId: !!process.env.DISCORD_CLIENT_ID,
      hasDiscordPublicKey: !!process.env.DISCORD_PUBLIC_KEY,
      hasDiscordApplicationId: !!process.env.DISCORD_APPLICATION_ID,
    },
  })
}

export async function POST(req: Request) {
  let body = "No body provided"

  try {
    // Try to parse the request body if it exists
    const text = await req.text()
    if (text) {
      body = JSON.parse(text)
    }
  } catch (error) {
    console.error("Error parsing request body:", error)
    // If parsing fails, just use the text
    body = await req.text()
  }

  return NextResponse.json({
    message: "POST request successful",
    receivedBody: body,
    timestamp: new Date().toISOString(),
  })
}
