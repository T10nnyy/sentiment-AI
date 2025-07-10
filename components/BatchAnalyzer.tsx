"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react"
import { useSentiment } from "@/hooks/useSentiment"
import type { BatchSentimentResult } from "@/lib/api"

export default function BatchAnalyzer() {
  const [texts, setTexts] = useState("")
  const [results, setResults] = useState<BatchSentimentResult | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { analyzeBatch, analyzeFile, loading, error } = useSentiment()

  const handleTextAnalysis = async () => {
    const textList = texts
      .split("\n")
      .map((text) => text.trim())
      .filter((text) => text.length > 0)

    if (textList.length === 0) return

    try {
      const result = await analyzeBatch(textList)
      setResults(result)
    } catch (err) {
      console.error("Batch analysis failed:", err)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleFileAnalysis = async () => {
    if (!uploadedFile) return

    try {
      const result = await analyzeFile(uploadedFile)
      setResults(result)
    } catch (err) {
      console.error("File analysis failed:", err)
    }
  }

  const handleReset = () => {
    setTexts("")
    setResults(null)
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      ["Text", "Sentiment", "Confidence", "Score"].join(","),
      ...results.results.map((result) =>
        [
          `"${result.text.replace(/"/g, '""')}"`,
          result.sentiment.label,
          (result.confidence * 100).toFixed(2) + "%",
          result.sentiment.score.toFixed(4),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sentiment-analysis-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSentimentIcon = (label: string) => {
    switch (label.toUpperCase()) {
      case "POSITIVE":
        return <ThumbsUp className="w-4 h-4 text-green-500" />
      case "NEGATIVE":
        return <ThumbsDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getSentimentColor = (label: string) => {
    switch (label.toUpperCase()) {
      case "POSITIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "NEGATIVE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const textCount = texts.split("\n").filter((text) => text.trim().length > 0).length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Input Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Text Input
            </CardTitle>
            <CardDescription>Enter multiple texts, one per line</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="Enter your texts here, one per line:&#10;&#10;I love this product!&#10;This service is terrible.&#10;The weather is nice today."
                value={texts}
                onChange={(e) => setTexts(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="text-sm text-muted-foreground mt-1">
                {textCount} texts • {texts.length} characters
              </div>
            </div>
            <Button onClick={handleTextAnalysis} disabled={textCount === 0 || loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Analyze {textCount} Text{textCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              File Upload
            </CardTitle>
            <CardDescription>Upload CSV or TXT files for batch analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">CSV or TXT files only</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-3">
                Choose File
              </Button>
            </div>

            {uploadedFile && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-gray-500">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}

            <Button onClick={handleFileAnalysis} disabled={!uploadedFile || loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Analyze File
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Analysis Failed</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Batch Analysis Results
                </CardTitle>
                <CardDescription>
                  Analyzed {results.results.length} texts in {(results.total_processing_time * 1000).toFixed(0)}ms (avg:{" "}
                  {(results.average_processing_time * 1000).toFixed(0)}ms per text)
                </CardDescription>
              </div>
              <Button onClick={exportResults} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.results.filter((r) => r.sentiment.label.toUpperCase() === "POSITIVE").length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Positive</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.results.filter((r) => r.sentiment.label.toUpperCase() === "NEGATIVE").length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Negative</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {
                    results.results.filter((r) => !["POSITIVE", "NEGATIVE"].includes(r.sentiment.label.toUpperCase()))
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
              </div>
            </div>

            <Separator />

            {/* Individual Results */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.results.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm flex-1">{result.text}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getSentimentIcon(result.sentiment.label)}
                      <Badge className={getSentimentColor(result.sentiment.label)}>{result.sentiment.label}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={result.confidence * 100} className="h-1" />
                    </div>
                    <span className="text-xs text-muted-foreground">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      {(texts || uploadedFile || results) && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleReset}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </div>
      )}
    </div>
  )
}
