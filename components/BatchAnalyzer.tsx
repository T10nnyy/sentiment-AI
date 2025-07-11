"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, Loader2 } from "lucide-react"
import { useSentiment } from "@/hooks/useSentiment"

export function BatchAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<any>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { loading, error, analyzeFile } = useSentiment()

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && (selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".txt"))) {
      setFile(selectedFile)
      setResults(null)
    } else {
      alert("Please select a CSV or TXT file")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    const batchResult = await analyzeFile(file)
    if (batchResult) {
      setResults(batchResult)
    }
  }

  const downloadResults = () => {
    if (!results) return

    const csvContent = [
      ["Text Index", "Sentiment", "Confidence", "Processing Time (ms)"],
      ...results.results.map((result: any, index: number) => [
        index + 1,
        result.label,
        (result.confidence * 100).toFixed(1) + "%",
        (result.processing_time * 1000).toFixed(1),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sentiment_analysis_results_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "negative":
        return "bg-red-100 text-red-800 border-red-200"
      case "neutral":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Batch Analysis
        </CardTitle>
        <CardDescription>Upload CSV or TXT files for batch sentiment analysis (max 1000 texts)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
        >
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">Drag and drop your file here, or click to select</p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Select File
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) handleFileSelect(selectedFile)
            }}
            className="hidden"
          />
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze File"
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analysis Results</h3>
              <Button onClick={downloadResults} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{results.results.length}</div>
                  <div className="text-sm text-gray-600">Total Texts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{results.total_processing_time.toFixed(2)}s</div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{(results.average_processing_time * 1000).toFixed(1)}ms</div>
                  <div className="text-sm text-gray-600">Avg per Text</div>
                </CardContent>
              </Card>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.results.map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                    <Badge className={getSentimentColor(result.label)}>{result.label}</Badge>
                  </div>
                  <div className="text-sm font-mono">{(result.confidence * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
