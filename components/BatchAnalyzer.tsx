"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Download,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  MessageSquare,
} from "lucide-react"
import { useSentiment } from "@/hooks/useSentiment"
import type { SentimentResult } from "@/types/sentiment"

export function BatchAnalyzer() {
  const [texts, setTexts] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<SentimentResult[]>([])
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { analyzeBatch, analyzeFile, loading, error } = useSentiment()

  const handleTextAnalysis = async () => {
    if (!texts.trim()) return

    const textList = texts
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    if (textList.length === 0) return

    setProcessing(true)
    try {
      const analysisResults = await analyzeBatch(textList)
      setResults(analysisResults)
    } catch (err) {
      console.error("Batch analysis failed:", err)
    } finally {
      setProcessing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
    }
  }

  const handleFileAnalysis = async () => {
    if (!file) return

    setProcessing(true)
    try {
      const analysisResults = await analyzeFile(file)
      setResults(analysisResults)
    } catch (err) {
      console.error("File analysis failed:", err)
    } finally {
      setProcessing(false)
    }
  }

  const downloadResults = () => {
    if (results.length === 0) return

    const csvContent = [
      ["Text", "Sentiment", "Confidence", "Positive Score", "Negative Score"],
      ...results.map((result) => [
        `"${result.text.replace(/"/g, '""')}"`,
        result.sentiment,
        (result.confidence * 100).toFixed(2),
        ((result.scores?.positive || 0) * 100).toFixed(2),
        ((result.scores?.negative || 0) * 100).toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sentiment_analysis_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <TrendingUp className="h-3 w-3" />
      case "negative":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <MessageSquare className="h-3 w-3" />
    }
  }

  const getOverallStats = () => {
    if (results.length === 0) return null

    const positive = results.filter((r) => r.sentiment.toLowerCase() === "positive").length
    const negative = results.filter((r) => r.sentiment.toLowerCase() === "negative").length
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length

    return { positive, negative, total: results.length, avgConfidence }
  }

  const stats = getOverallStats()

  return (
    <div className="space-y-6">
      {/* Input Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Text Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>Enter multiple texts (one per line)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter texts to analyze (one per line)..."
              value={texts}
              onChange={(e) => setTexts(e.target.value)}
              className="min-h-[120px]"
            />
            <Button onClick={handleTextAnalysis} disabled={!texts.trim() || processing} className="w-full">
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze Texts
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </CardTitle>
            <CardDescription>Upload a CSV file for batch analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mb-2">
                <Upload className="mr-2 h-4 w-4" />
                Choose CSV File
              </Button>
              {file && <p className="text-sm text-gray-600 dark:text-gray-400">Selected: {file.name}</p>}
            </div>
            <Button onClick={handleFileAnalysis} disabled={!file || processing} className="w-full">
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze File
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Analysis Results
                </CardTitle>
                <CardDescription>Processed {results.length} texts</CardDescription>
              </div>
              <Button onClick={downloadResults} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
                  <div className="text-sm text-green-600">Positive</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
                  <div className="text-sm text-red-600">Negative</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{(stats.avgConfidence * 100).toFixed(1)}%</div>
                  <div className="text-sm text-purple-600">Avg Confidence</div>
                </div>
              </div>
            )}

            <Separator />

            {/* Results List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm flex-1">
                      {result.text.length > 100 ? `${result.text.substring(0, 100)}...` : result.text}
                    </p>
                    <Badge className={`${getSentimentColor(result.sentiment)} text-white flex items-center gap-1`}>
                      {getSentimentIcon(result.sentiment)}
                      {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                    {result.scores && (
                      <>
                        <span>Positive: {((result.scores.positive || 0) * 100).toFixed(1)}%</span>
                        <span>Negative: {((result.scores.negative || 0) * 100).toFixed(1)}%</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
