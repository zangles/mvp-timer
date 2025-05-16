import { REST, Routes } from "discord.js"
import { readdirSync } from "fs"
import path from "path"

// Load environment variables
const token = process.env.DISCORD_BOT_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID

if (!token || !clientId) {
  console.error("Missing environment variables: DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID")
  process.exit(1)
}

const commands = []
// Grab all command files
const commandsPath = path.join(process.cwd(), "commands")
const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath).default
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON())
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token)

// Deploy commands
;(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    // The put method is used to fully refresh all commands with the current set
    const data = await rest.put(Routes.applicationCommands(clientId), { body: commands })

    console.log(`Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    console.error(error)
  }
})()
