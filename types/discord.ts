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

// Command option types
export enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
  ATTACHMENT = 11,
}

// Discord interaction
export interface DiscordInteraction {
  id: string
  application_id: string
  type: InteractionType
  data?: {
    id: string
    name: string
    options?: {
      name: string
      value: string | number | boolean
    }[]
  }
  guild_id?: string
  channel_id?: string
  member?: {
    user: {
      id: string
      username: string
    }
  }
  user?: {
    id: string
    username: string
  }
  token: string
  version: number
}

// Discord embed
export interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  timestamp?: string
  color?: number
  footer?: {
    text: string
    icon_url?: string
  }
  image?: {
    url: string
  }
  thumbnail?: {
    url: string
  }
  author?: {
    name: string
    url?: string
    icon_url?: string
  }
  fields?: {
    name: string
    value: string
    inline?: boolean
  }[]
}

// Discord command
export interface DiscordCommand {
  name: string
  description: string
  options?: {
    name: string
    description: string
    type: ApplicationCommandOptionType
    required?: boolean
    choices?: {
      name: string
      value: string | number
    }[]
  }[]
}
