import { verifyKey } from "discord-interactions"

// Discord interaction types
export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

// Discord interaction response types
export enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  MODAL = 9,
}

// Verify Discord requests
export function verifyDiscordRequest(body: string, signature: string, timestamp: string, publicKey: string): boolean {
  return verifyKey(body, signature, timestamp, publicKey)
}

// Create a simple embed
export function createEmbed(title: string, description: string, fields: any[] = [], color = 0x0099ff) {
  return {
    title,
    description,
    color,
    fields,
    timestamp: new Date().toISOString(),
  }
}
