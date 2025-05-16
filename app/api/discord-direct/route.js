import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req) {
  try {
    // Get the signature and timestamp from the headers
    const signature = req.headers.get("x-signature-ed25519")
    const timestamp = req.headers.get("x-signature-timestamp")

    // Get the raw body
    const body = await req.text()

    console.log("DIRECT VERIFICATION - Request received")
    console.log("Signature:", signature)
    console.log("Timestamp:", timestamp)
    console.log("Body length:", body.length)

    // Check if we have all the required data
    if (!signature || !timestamp || !process.env.DISCORD_PUBLIC_KEY) {
      console.log("Missing required data for verification")
      return NextResponse.json({ error: "Missing required data" }, { status: 401 })
    }

    // Implement direct verification
    try {
      // Convert the hex signature to a Buffer
      const signatureBuffer = Buffer.from(signature, "hex")

      // Create the message that was signed (timestamp + body)
      const message = Buffer.from(timestamp + body)

      // Convert the hex public key to a Buffer
      const publicKeyBuffer = Buffer.from(process.env.DISCORD_PUBLIC_KEY, "hex")

      // Verify the signature
      const isValid = crypto.verify("ed25519", message, publicKeyBuffer, signatureBuffer)

      console.log("Direct verification result:", isValid)

      if (!isValid) {
        console.log("Invalid signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }

      // Parse the request body
      const interaction = JSON.parse(body)

      // Handle PING interaction (type 1)
      if (interaction.type === 1) {
        console.log("Responding to PING with PONG")
        return NextResponse.json({ type: 1 })
      }

      // For any other interaction, respond with a simple message
      return NextResponse.json({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: "Command received!",
        },
      })
    } catch (verifyError) {
      console.error("Verification error:", verifyError)
      return NextResponse.json({ error: "Verification error" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error in direct verification endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req) {
  return NextResponse.json({
    message: "This is a direct verification endpoint for Discord interactions.",
    timestamp: new Date().toISOString(),
  })
}
