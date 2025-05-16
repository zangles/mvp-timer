import { getTrackers, getMVPById } from "./mvp-service"

// Default notification times in minutes before respawn
const DEFAULT_NOTIFICATION_TIMES = [5, 1]

export async function checkAndSendNotifications() {
  try {
    // Get all trackers
    const trackers = getTrackers()
    const now = new Date()

    // Check each tracker
    for (const tracker of trackers) {
      // Skip if no expected respawn time
      if (!tracker.expectedRespawn) continue

      const mvp = getMVPById(tracker.mvpId)
      if (!mvp) continue

      const respawnTime = new Date(tracker.expectedRespawn)
      const timeUntilRespawn = respawnTime.getTime() - now.getTime()
      const minutesUntilRespawn = Math.floor(timeUntilRespawn / (1000 * 60))

      // Check if we should send a notification
      if (
        DEFAULT_NOTIFICATION_TIMES.includes(minutesUntilRespawn) || // Notify at specific times before respawn
        (timeUntilRespawn <= 0 && timeUntilRespawn > -60000) // Notify when respawn is happening (within the last minute)
      ) {
        // Skip web interface trackers if they don't have valid Discord settings
        if (tracker.guildId === "web-interface" && tracker.channelId === "dashboard") {
          console.log(`Skipping notification for web interface MVP ${mvp.name} - no Discord channel configured`)
          continue
        }

        await sendRespawnNotification(tracker, mvp, minutesUntilRespawn)
      }
    }
  } catch (error) {
    console.error("Error checking and sending notifications:", error)
  }
}

async function sendRespawnNotification(tracker, mvp, minutesUntilRespawn) {
  try {
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.error("Missing DISCORD_BOT_TOKEN")
      return
    }

    // Create the notification message
    const embed = {
      title: `${mvp.name} Respawn Alert!`,
      color: minutesUntilRespawn <= 0 ? 0xff0000 : 0xffaa00,
      description:
        minutesUntilRespawn <= 0
          ? `**${mvp.name}** is respawning now!`
          : `**${mvp.name}** will respawn in **${minutesUntilRespawn}** minutes!`,
      fields: [
        {
          name: "Location",
          value: mvp.locations.map((loc) => `${loc.map} (${loc.x}, ${loc.y})`).join("\n"),
          inline: true,
        },
        {
          name: "Killed By",
          value: tracker.killedBy || "Unknown",
          inline: true,
        },
      ],
      thumbnail: mvp.imageUrl ? { url: mvp.imageUrl } : null,
    }

    // Send the notification using Discord's REST API
    const url = `https://discord.com/api/v10/channels/${tracker.channelId}/messages`

    const content = minutesUntilRespawn <= 0 ? `@here ${mvp.name} is respawning now!` : null

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        content,
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to send notification: ${errorText}`)
    }

    // Add a flag to the tracker to prevent duplicate notifications
    tracker.notifiedAt = minutesUntilRespawn
  } catch (error) {
    console.error(`Error sending notification for MVP ${mvp.name}:`, error)
  }
}
