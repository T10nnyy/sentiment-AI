import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { texts } = await request.json()

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: "Texts array is required" }, { status: 400 })
    }

    if (texts.length === 0) {
      return NextResponse.json({ error: "At least one text is required" }, { status: 400 })
    }

    if (texts.length > 100) {
      return NextResponse.json({ error: "Maximum 100 texts allowed" }, { status: 400 })
    }

    // Call the Python backend
    const backendResponse = await fetch("http://localhost:8000/api/predict/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts }),
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error("Backend error:", errorText)
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    const result = await backendResponse.json()

    // Transform the results to match our frontend interface
    const transformedResults = {
      results:
        result.results?.map((r: any, index: number) => ({
          text: texts[index],
          sentiment: {
            label: r.label || r.sentiment?.label || "UNKNOWN",
            score: r.score || r.sentiment?.score || 0,
          },
          confidence: r.confidence || r.score || 0,
          processing_time: r.processing_time || 0,
          scores: r.scores || {},
        })) || [],
      total_processing_time: result.total_processing_time || 0,
      average_processing_time: result.average_processing_time || 0,
    }

    return NextResponse.json(transformedResults)
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
