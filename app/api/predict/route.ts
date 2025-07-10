import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 })
    }

    // Call the Python backend
    const backendResponse = await fetch("http://localhost:8000/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error("Backend error:", errorText)
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    const result = await backendResponse.json()

    // Transform the result to match our frontend interface
    const transformedResult = {
      text: text,
      sentiment: {
        label: result.label || result.sentiment?.label || "UNKNOWN",
        score: result.score || result.sentiment?.score || 0,
      },
      confidence: result.confidence || result.score || 0,
      processing_time: result.processing_time || 0,
      scores: result.scores || {},
    }

    return NextResponse.json(transformedResult)
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
