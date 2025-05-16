import { NextResponse } from "next/server"

export async function GET(req) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY || "Not set"

  // Format the key for display
  let formattedKey = publicKey
  if (publicKey !== "Not set") {
    formattedKey = publicKey.substring(0, 4) + "..." + publicKey.substring(publicKey.length - 4)
  }

  // Check if the key is in the correct format (hex string)
  let isValidFormat = false
  if (publicKey !== "Not set") {
    isValidFormat = /^[0-9a-f]{64}$/i.test(publicKey)
  }

  return NextResponse.json({
    publicKeyStatus: publicKey !== "Not set" ? "Set" : "Not set",
    publicKeyPreview: formattedKey,
    publicKeyLength: publicKey.length,
    isValidFormat: isValidFormat,
    checkTime: new Date().toISOString(),
  })
}
