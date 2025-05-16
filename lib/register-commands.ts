// Command definitions
const commands = [
  {
    name: "hello",
    description: "Replies with a greeting",
  },
  {
    name: "echo",
    description: "Echoes your message",
    options: [
      {
        name: "message",
        description: "The message to echo",
        type: 3, // STRING type
        required: true,
      },
    ],
  },
]

/**
 * Register slash commands with Discord
 * Run this script once to register your commands
 */
export async function registerCommands() {
  if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_APPLICATION_ID) {
    throw new Error("Missing Discord credentials in environment variables")
  }

  const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_APPLICATION_ID}/commands`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    },
    method: "PUT",
    body: JSON.stringify(commands),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Error registering commands: ${text}`)
  }

  const data = await response.json()
  return data
}
