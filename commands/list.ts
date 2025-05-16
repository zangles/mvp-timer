import { getTrackedMVPs, getMVPById, formatRespawnTime } from "@/lib/mvp-service"

export default {
  data: {
    name: "list",
    description: "List all tracked MVPs in this server",
  },

  async execute(interaction) {
    const trackers = getTrackedMVPs(interaction.guild_id)

    if (trackers.length === 0) {
      return {
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: "No MVPs are currently being tracked in this server.",
          flags: 64, // Ephemeral flag
        },
      }
    }

    const embed = {
      title: "Tracked MVPs",
      description: "List of MVPs being tracked in this server",
      color: 0x0099ff,
      fields: [],
    }

    for (const tracker of trackers) {
      const mvp = getMVPById(tracker.mvpId)
      if (!mvp) continue

      const respawnTime = tracker.expectedRespawn ? formatRespawnTime(new Date(tracker.expectedRespawn)) : "Unknown"

      embed.fields.push({
        name: mvp.name,
        value: `Killed by: ${tracker.killedBy || "Unknown"}\nRespawn: ${respawnTime}`,
        inline: true,
      })
    }

    return {
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds: [embed],
      },
    }
  },
}
