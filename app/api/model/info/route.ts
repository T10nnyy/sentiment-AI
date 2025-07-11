import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Forward request to Python backend
    const response = await fetch("http://localhost:8000/api/model/info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to get model info" }, { status: 500 })
  }
}
