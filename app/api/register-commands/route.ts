import { NextResponse } from "next/server"
import { ApplicationCommandOptionType } from "@/types/discord"

// Command definitions
const commands = [
  {
    name: "ping",
    description: "Check if the bot is online",
  },
  {
    name: "help",
    description: "Shows help information for Sprinkles bot",
  },
  {
    name: "mvp",
    description: "Get information about a Ragnarok MVP",
    options: [
      {
        name: "name",
        description: "The name of the MVP",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
    ],
  },
  {
    name: "track",
    description: "Track an MVP kill to get notified when it respawns",
    options: [
      {
        name: "name",
        description: "The name of the MVP",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
      {
        name: "location",
        description: "The location index (0 for first location, 1 for second, etc.)",
        type: ApplicationCommandOptionType.INTEGER,
        required: false,
      },
      {
        name: "killer",
        description: "Who killed the MVP (optional)",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
    ],
  },
  {
    name: "list",
    description: "List all tracked MVPs in this server",
  },
]

export async function GET() {
  try {
    // Load environment variables
    const token = process.env.DISCORD_BOT_TOKEN
    const applicationId = process.env.DISCORD_APPLICATION_ID

    if (!token || !applicationId) {
      return NextResponse.json(
        { error: "Missing environment variables: DISCORD_BOT_TOKEN or DISCORD_APPLICATION_ID" },
        { status: 500 },
      )
    }

    // Register commands
    const url = `https://discord.com/api/v10/applications/${applicationId}/commands`

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
    return NextResponse.json({ error: "Failed to register commands", details: error.message }, { status: 500 })
  }
}
