import { ApplicationCommandOptionType } from "@/types/discord"
import { getMVPByName, trackMVP } from "@/lib/mvp-service"

export default {
  data: {
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
        name: "killer",
        description: "Who killed the MVP (optional)",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
      {
        name: "notify",
        description: "Send notifications before respawn (default: true)",
        type: ApplicationCommandOptionType.BOOLEAN,
        required: false,
      },
    ],
  },

  async execute(interaction) {
    const mvpName = interaction.data.options.find((opt) => opt.name === "name")?.value
    const killer =
      interaction.data.options.find((opt) => opt.name === "killer")?.value || interaction.member.user.username
    const notify = interaction.data.options.find((opt) => opt.name === "notify")?.value ?? true

    const mvp = getMVPByName(mvpName)

    if (!mvp) {
      return {
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: `MVP "${mvpName}" not found.`,
          flags: 64, // Ephemeral flag
        },
      }
    }

    const tracker = trackMVP(mvp.id, interaction.guild_id, interaction.channel_id, killer)

    const embed = {
      title: `${mvp.name} Tracked`,
      description: `${mvp.name} was killed by ${killer}`,
      fields: [
        { name: "Killed At", value: new Date(tracker.lastKilled).toLocaleString(), inline: true },
        { name: "Expected Respawn", value: new Date(tracker.expectedRespawn).toLocaleString(), inline: true },
        { name: "Respawn Time", value: `${mvp.respawnTime} minutes`, inline: true },
        { name: "Notifications", value: notify ? "Enabled" : "Disabled", inline: true },
      ],
      color: 0x00ff00,
      thumbnail: mvp.imageUrl ? { url: mvp.imageUrl } : null,
    }

    return {
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content: notify ? "I'll notify this channel when the MVP is about to respawn!" : null,
        embeds: [embed],
      },
    }
  },
}
