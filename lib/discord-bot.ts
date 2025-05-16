import { Client, Events, GatewayIntentBits, Collection } from "discord.js"
import { readdirSync } from "fs"
import path from "path"
import type { Command } from "@/types/command"

// Create a new client instance with proper intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  // Disable unnecessary caching to reduce memory usage
  makeCache: (Options) => {
    const { sweepers } = Options
    // Sweep messages every 5 minutes, removing messages older than 30 minutes
    sweepers.messages = {
      interval: 300, // 5 minutes
      lifetime: 1800, // 30 minutes
    }
    return Options
  },
})

// Create a collection for commands
client.commands = new Collection<string, Command>()

// Initialize the bot
export async function initializeBot() {
  try {
    // Register commands
    const commandsPath = path.join(process.cwd(), "commands")
    const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file)
      const command = require(filePath).default

      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command)
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
      }
    }

    // When the client is ready, run this code (only once)
    client.once(Events.ClientReady, (readyClient) => {
      console.log(`Ready! Logged in as ${readyClient.user.tag}`)
    })

    // Handle interactions
    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return

      const command = client.commands.get(interaction.commandName)

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
      }

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(error)
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true })
        } else {
          await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
        }
      }
    })

    // Log in to Discord with your client's token
    await client.login(process.env.DISCORD_BOT_TOKEN)

    return client
  } catch (error) {
    console.error("Failed to initialize bot:", error)
    throw error
  }
}

export { client }
