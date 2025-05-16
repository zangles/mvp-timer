import { ApplicationCommandOptionType } from "@/types/discord"
import { getMVPByName } from "@/lib/mvp-service"

export default {
  data: {
    name: "mvp",
    description: "Get information about a Ragnarok MVP",
    options: [
      {
        name: "name",
        description: "The name of the MVP",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
    ],
  },

  async execute(interaction) {
    const mvpName = interaction.data.options.find((opt) => opt.name === "name")?.value
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

    const embed = {
      title: `${mvp.name} (Lv. ${mvp.level})`,
      description: "A powerful MVP boss from Ragnarok Online.",
      color: 0x0099ff,
      fields: [
        { name: "HP", value: mvp.hp.toLocaleString(), inline: true },
        { name: "Base EXP", value: mvp.exp.toLocaleString(), inline: true },
        { name: "Respawn Time", value: `${mvp.respawnTime} minutes`, inline: true },
        {
          name: "Locations",
          value: mvp.locations.map((loc) => `${loc.map} (${loc.x}, ${loc.y})`).join("\n"),
        },
        {
          name: "Notable Drops",
          value: mvp.drops.map((drop) => `${drop.name} (${drop.chance}%)`).join("\n"),
        },
      ],
      thumbnail: mvp.imageUrl ? { url: mvp.imageUrl } : null,
    }

    return {
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds: [embed],
      },
    }
  },
}
