import { verifyKey } from "discord-interactions"
import type { DiscordCommand, DiscordEmbed, InteractionResponseType } from "@/types/discord"

// Verify Discord requests
export function verifyDiscordRequest(body: string, signature: string, timestamp: string, publicKey: string): boolean {
  return verifyKey(body, signature, timestamp, publicKey)
}

// Create a Discord response
export function createDiscordResponse(type: InteractionResponseType, data?: any) {
  return {
    type,
    data,
  }
}

// Register commands with Discord
export async function registerCommands(commands: DiscordCommand[], applicationId: string, token: string) {
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
    throw new Error(`Error registering commands: ${text}`)
  }

  return await response.json()
}

// Create an embed
export function createEmbed(
  title: string,
  description: string,
  fields: { name: string; value: string; inline?: boolean }[] = [],
  color = 0x0099ff,
): DiscordEmbed {
  return {
    title,
    description,
    color,
    fields,
    timestamp: new Date().toISOString(),
  }
}
