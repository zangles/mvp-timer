import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { getTrackedMVPs, getMVPById } from "@/lib/mvp-service"

export default {
  data: new SlashCommandBuilder()
    .setName("notify")
    .setDescription("Configure MVP respawn notifications")
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List all MVPs with notifications enabled"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable notifications for an MVP")
        .addStringOption((option) =>
          option.setName("name").setDescription("The name of the MVP").setRequired(true).setAutocomplete(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable notifications for an MVP")
        .addStringOption((option) =>
          option.setName("name").setDescription("The name of the MVP").setRequired(true).setAutocomplete(true),
        ),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === "list") {
      const trackers = getTrackedMVPs(interaction.guildId)

      if (trackers.length === 0) {
        return interaction.reply({ content: "No MVPs are currently being tracked in this server.", ephemeral: true })
      }

      const embed = new EmbedBuilder()
        .setTitle("MVP Notification Settings")
        .setDescription("MVPs with notifications enabled in this server")
        .setColor(0x0099ff)

      for (const tracker of trackers) {
        const mvp = getMVPById(tracker.mvpId)
        if (!mvp) continue

        embed.addFields({
          name: mvp.name,
          value: `Notifications: ${tracker.notifiedAt !== undefined ? "Enabled" : "Disabled"}`,
          inline: true,
        })
      }

      return interaction.reply({ embeds: [embed] })
    }

    // Enable/disable notifications logic would go here
    // For now, we'll just acknowledge the command
    return interaction.reply({
      content: `${subcommand === "enable" ? "Enabled" : "Disabled"} notifications for the specified MVP.`,
      ephemeral: true,
    })
  },

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase()
    const trackers = getTrackedMVPs(interaction.guildId)

    const mvps = trackers.map((tracker) => getMVPById(tracker.mvpId)).filter(Boolean)
    const filtered = mvps.filter((mvp) => mvp.name.toLowerCase().includes(focusedValue)).slice(0, 25)

    await interaction.respond(filtered.map((mvp) => ({ name: mvp.name, value: mvp.name })))
  },
}
