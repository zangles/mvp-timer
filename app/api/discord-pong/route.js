import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    // Always respond with PONG
    return NextResponse.json({ type: 1 })
  } catch (error) {
    console.error("Error in PONG endpoint:", error)
    // Still respond with PONG even if there's an error
    return NextResponse.json({ type: 1 })
  }
}

export async function GET(req) {
  return NextResponse.json({
    message: "This endpoint always responds with PONG for Discord interactions.",
    timestamp: new Date().toISOString(),
  })
}
