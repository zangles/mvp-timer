import type { SlashCommandBuilder, CommandInteraction } from "discord.js"

export interface Command {
  data: SlashCommandBuilder | any
  execute: (interaction: CommandInteraction) => Promise<void>
}
