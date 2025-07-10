"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useSentiment } from "@/hooks/useSentiment"
import { Upload, Download, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { BatchResult } from "@/types/sentiment"

export default function BatchAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<BatchResult | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { analyzeBatch, loading } = useSentiment()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "text/plain" || selectedFile.name.endsWith(".txt")) {
        setFile(selectedFile)
        setResults(null)
        setProgress(0)
      } else {
        toast.error("Please select a .txt file")
      }
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await analyzeBatch(formData, (progress) => {
        setProgress(progress)
      })

      setResults(result)
      toast.success("Batch analysis completed!")
    } catch (error) {
      toast.error("Failed to analyze batch")
      console.error("Batch analysis error:", error)
    }
  }

  const handleDownload = () => {
    if (!results) return

    const csvContent = [
      "Text,Sentiment,Confidence,Positive Score,Negative Score,Neutral Score",
      ...results.results.map(
        (item) =>
          `"${item.text.replace(/"/g, '""')}",${item.sentiment},${item.confidence},${item.scores?.positive || 0},${item.scores?.negative || 0},${item.scores?.neutral || 0}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sentiment_analysis_results.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "default" as const
      case "negative":
        return "destructive" as const
      case "neutral":
        return "secondary" as const
      default:
        return "outline" as const
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".txt" className="hidden" />

            {file ? (
              <div className="space-y-2">
                <FileText className="w-8 h-8 mx-auto text-blue-500" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-sm text-muted-foreground">Click to select a .txt file for batch analysis</p>
              </div>
            )}

            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-4">
              Select File
            </Button>
          </div>

          <Button onClick={handleAnalyze} disabled={!file || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing... {progress}%
              </>
            ) : (
              "Analyze Batch"
            )}
          </Button>

          {loading && <Progress value={progress} className="w-full" />}
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Results ({results.results.length} items)
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{results.summary.positive}</div>
                  <div className="text-sm text-muted-foreground">Positive</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{results.summary.negative}</div>
                  <div className="text-sm text-muted-foreground">Negative</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">{results.summary.neutral}</div>
                  <div className="text-sm text-muted-foreground">Neutral</div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.results.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.text}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={getSentimentBadgeVariant(item.sentiment)}>{item.sentiment}</Badge>
                      <span className="text-xs text-muted-foreground">{(item.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
