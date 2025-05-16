import { NextResponse } from "next/server"
import { verifyKey } from "discord-interactions"

export async function POST(req) {
  try {
    // Get the signature and timestamp from the headers
    const signature = req.headers.get("x-signature-ed25519")
    const timestamp = req.headers.get("x-signature-timestamp")

    // Get the raw body
    const body = await req.text()

    console.log("MINIMAL ENDPOINT - Request received")
    console.log("Signature:", signature)
    console.log("Timestamp:", timestamp)
    console.log("Body length:", body.length)
    console.log("Public key:", process.env.DISCORD_PUBLIC_KEY)

    // Check if we have all the required data
    if (!signature || !timestamp || !process.env.DISCORD_PUBLIC_KEY) {
      console.log("Missing required data for verification")
      return NextResponse.json({ type: 1 }) // Still respond with PONG for testing
    }

    // Try verification
    try {
      const isValid = verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY)
      console.log("Verification result:", isValid)

      // Always respond with PONG for testing
      return NextResponse.json({ type: 1 })
    } catch (verifyError) {
      console.error("Verification error:", verifyError)
      // Still respond with PONG for testing
      return NextResponse.json({ type: 1 })
    }
  } catch (error) {
    console.error("Error in minimal endpoint:", error)
    // Still respond with PONG for testing
    return NextResponse.json({ type: 1 })
  }
}

export async function GET(req) {
  return NextResponse.json({
    message: "This is a minimal test endpoint for Discord interactions.",
    timestamp: new Date().toISOString(),
  })
}
