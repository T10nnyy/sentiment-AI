import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    // Forward request to Python backend
    const backendFormData = new FormData()
    backendFormData.append("file", file)

    const response = await fetch("http://localhost:8000/api/analyze/file", {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to analyze file" }, { status: 500 })
  }
}
