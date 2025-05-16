import { NextResponse } from "next/server"

// Command definitions
const commands = [
  {
    name: "ping",
    description: "Check if the bot is online",
  },
]

export async function GET(req: Request) {
  try {
    // Load environment variables
    const token = process.env.DISCORD_BOT_TOKEN
    const clientId = process.env.DISCORD_CLIENT_ID

    if (!token || !clientId) {
      return NextResponse.json(
        { error: "Missing environment variables: DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID" },
        { status: 500 },
      )
    }

    // Register commands
    const url = `https://discord.com/api/v10/applications/${clientId}/commands`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${token}`,
      },
      method: "PUT",
      body: JSON.stringify(commands),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: `Error registering commands: ${text}` }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, commands: data })
  } catch (error) {
    console.error("Error registering commands:", error)
    return NextResponse.json({ error: "Failed to register commands" }, { status: 500 })
  }
}
