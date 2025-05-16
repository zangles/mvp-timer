# Sprinkles - Ragnarok MVP Helper Discord Bot

A Discord bot to help track MVPs in Ragnarok Online.

## Features

- Get detailed information about MVPs
- Track MVP kills and respawn times
- Receive notifications when MVPs are about to respawn
- Autocomplete support for MVP names

## Setup

1. Create a Discord application in the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a bot for your application and copy the token
3. Add the following environment variables to your Vercel project:
   - `DISCORD_BOT_TOKEN` - Your bot token
   - `DISCORD_CLIENT_ID` - Your application ID
   - `DISCORD_PUBLIC_KEY` - Your application's public key
4. Deploy your bot to Vercel
5. Register your commands by visiting `/api/register-commands`
6. Set your Interactions Endpoint URL to `/api/discord-webhook`
7. Invite your bot to your server

## Setting Up Respawn Notifications

To enable respawn notifications, you need to set up a scheduled job to call the `/api/check-respawns` endpoint regularly. Here are a few options:

### Option 1: Vercel Cron Jobs

If you have a Vercel Pro account, you can use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) to schedule the respawn checks.

Add the following to your `vercel.json` file:

\`\`\`json
{
  "crons": [
    {
      "path": "/api/check-respawns",
      "schedule": "* * * * *"
    }
  ]
}
\`\`\`

This will call the endpoint every minute.

### Option 2: External Cron Service

You can use an external service like [Uptime Robot](https://uptimerobot.com/) or [Cron-job.org](https://cron-job.org/) to call your endpoint regularly.

1. Create an account on the service
2. Set up a new monitor/cron job
3. Set the URL to `https://your-app.vercel.app/api/check-respawns`
4. Set the interval to 1 minute

### Option 3: GitHub Actions

You can use GitHub Actions to call your endpoint regularly.

Create a file `.github/workflows/cron.yml` in your repository:

\`\`\`yaml
name: Check MVP Respawns

on:
  schedule:
    - cron: '* * * * *'  # Every minute

jobs:
  check-respawns:
    runs-on: ubuntu-latest
    steps:
      - name: Call check-respawns endpoint
        run: curl -X GET https://your-app.vercel.app/api/check-respawns
\`\`\`

## Commands

- `/mvp [name]` - Get detailed information about an MVP boss
- `/track [name] [killer] [notify]` - Track an MVP kill to get notified when it respawns
- `/list` - List all tracked MVPs in this server
- `/notify list` - List all MVPs with notifications enabled
- `/notify enable [name]` - Enable notifications for an MVP
- `/notify disable [name]` - Disable notifications for an MVP
- `/help` - Shows help information
\`\`\`

Finally, let's update our dashboard page to include information about the notification system:
