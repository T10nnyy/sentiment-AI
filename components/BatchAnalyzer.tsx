"use client"

import type React from "react"
import { useState } from "react"
import { Upload, FileText, Download, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useBatchPrediction } from "@/hooks/useSentiment"
import ResultDisplay from "./ResultDisplay"
import type { SentimentResult } from "@/types/sentiment"

const BatchAnalyzer: React.FC = () => {
  const [texts, setTexts] = useState<string[]>([""])
  const [results, setResults] = useState<SentimentResult[]>([])
  const batchPrediction = useBatchPrediction()

  const addTextInput = () => {
    setTexts([...texts, ""])
  }

  const removeTextInput = (index: number) => {
    if (texts.length > 1) {
      setTexts(texts.filter((_, i) => i !== index))
    }
  }

  const updateText = (index: number, value: string) => {
    const newTexts = [...texts]
    newTexts[index] = value
    setTexts(newTexts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validTexts = texts.filter((text) => text.trim())
    if (validTexts.length === 0) return

    try {
      const batchResults = await batchPrediction.mutateAsync(validTexts)
      setResults(batchResults)
    } catch (error) {
      console.error("Batch prediction failed:", error)
    }
  }

  const exportResults = () => {
    const csvContent = [
      ["Text", "Sentiment", "Confidence"],
      ...results.map((result, index) => [
        `"${texts[index]?.replace(/"/g, '""')}"`,
        result.label,
        (result.score * 100).toFixed(2) + "%",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sentiment_analysis_results.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-2" />
            Batch Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {texts.map((text, index) => (
              <div key={index} className="flex space-x-2">
                <Textarea
                  value={text}
                  onChange={(e) => updateText(index, e.target.value)}
                  placeholder={`Enter text ${index + 1}...`}
                  className="flex-1"
                  disabled={batchPrediction.isLoading}
                />
                {texts.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTextInput(index)}
                    disabled={batchPrediction.isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={addTextInput} disabled={batchPrediction.isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Add Text
              </Button>

              <Button type="submit" disabled={texts.every((t) => !t.trim()) || batchPrediction.isLoading}>
                {batchPrediction.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Analyze Batch
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Batch Results ({results.length})</CardTitle>
              <Button variant="outline" onClick={exportResults}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Text {index + 1}:</div>
                  <div className="text-gray-800 mb-3">{texts[index]}</div>
                  <ResultDisplay result={result} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BatchAnalyzer
