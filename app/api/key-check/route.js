import { NextResponse } from "next/server"

export async function GET(req) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY || "Not set"

  // Format the key for display
  let formattedKey = publicKey
  if (publicKey !== "Not set") {
    formattedKey = publicKey.substring(0, 8) + "..." + publicKey.substring(publicKey.length - 8)
  }

  // Check if the key is in the correct format (hex string)
  let isValidFormat = false
  const formatIssues = []

  if (publicKey !== "Not set") {
    // Check length
    if (publicKey.length !== 64) {
      formatIssues.push(`Length is ${publicKey.length}, should be 64 characters`)
    }

    // Check if it's a valid hex string
    if (!/^[0-9a-f]+$/i.test(publicKey)) {
      formatIssues.push("Contains non-hexadecimal characters")
    }

    isValidFormat = publicKey.length === 64 && /^[0-9a-f]+$/i.test(publicKey)
  }

  return NextResponse.json({
    publicKeyStatus: publicKey !== "Not set" ? "Set" : "Not set",
    publicKeyPreview: formattedKey,
    publicKeyLength: publicKey.length,
    isValidFormat: isValidFormat,
    formatIssues: formatIssues,
    checkTime: new Date().toISOString(),
  })
}
