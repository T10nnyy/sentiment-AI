import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { texts } = await request.json()

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: "Texts array is required" }, { status: 400 })
    }

    // Forward request to Python backend
    const response = await fetch("http://localhost:8000/api/predict/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to analyze batch sentiment" }, { status: 500 })
  }
}
