import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    // Log all headers
    const headers = Object.fromEntries(req.headers.entries())
    console.log("Received headers:", JSON.stringify(headers, null, 2))

    // Get the raw body
    const body = await req.text()
    console.log("Received body:", body)

    // Always respond with PONG for testing
    return NextResponse.json({ type: 1 })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req) {
  return NextResponse.json({
    message: "This is a test endpoint for Discord interactions. It will always respond with PONG for POST requests.",
    timestamp: new Date().toISOString(),
  })
}
