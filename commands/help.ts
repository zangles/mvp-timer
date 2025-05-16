export default {
  data: {
    name: "help",
    description: "Shows help information for Sprinkles bot",
  },

  async execute(interaction) {
    const embed = {
      title: "Sprinkles - Ragnarok MVP Helper",
      description: "A Discord bot to help track MVPs in Ragnarok Online",
      color: 0x0099ff,
      fields: [
        {
          name: "/mvp [name]",
          value: "Get detailed information about an MVP boss",
        },
        {
          name: "/track [name] [killer] [notify]",
          value: "Track an MVP kill to get notified when it respawns",
        },
        {
          name: "/list",
          value: "List all tracked MVPs in this server",
        },
        {
          name: "/help",
          value: "Shows this help message",
        },
      ],
      footer: {
        text: "Sprinkles v1.0.0",
      },
    }

    return {
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds: [embed],
      },
    }
  },
}
