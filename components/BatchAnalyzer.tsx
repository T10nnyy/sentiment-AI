"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload, FileText, Download, Trash2, Plus } from "lucide-react"
import { useBatchPrediction } from "@/hooks/useSentiment"
import {
  formatSentimentLabel,
  getSentimentColor,
  formatConfidence,
  formatProcessingTime,
  exportToCSV,
  validateFileType,
  formatFileSize,
} from "@/lib/utils"

export default function BatchAnalyzer() {
  const [texts, setTexts] = useState<string[]>([""])
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { results, loading, error, predictBatch, analyzeFile, reset } = useBatchPrediction()

  const handleAddText = () => {
    setTexts([...texts, ""])
  }

  const handleRemoveText = (index: number) => {
    if (texts.length > 1) {
      setTexts(texts.filter((_, i) => i !== index))
    }
  }

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...texts]
    newTexts[index] = value
    setTexts(newTexts)
  }

  const handleAnalyzeTexts = async () => {
    const validTexts = texts.filter((text) => text.trim())
    if (validTexts.length === 0) return

    await predictBatch(validTexts)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && validateFileType(selectedFile)) {
      setFile(selectedFile)
      reset() // Clear previous results
    } else {
      alert("Please select a valid CSV or TXT file")
    }
  }

  const handleAnalyzeFile = async () => {
    if (!file) return
    await analyzeFile(file)
  }

  const handleExportResults = () => {
    if (!results?.results) return

    const exportData = results.results.map((result, index) => ({
      index: index + 1,
      text: result.text,
      sentiment: formatSentimentLabel(result.sentiment.label),
      confidence: formatConfidence(result.confidence),
      processing_time: formatProcessingTime(result.processing_time),
      ...result.scores,
    }))

    exportToCSV(exportData, `sentiment-analysis-${new Date().toISOString().split("T")[0]}.csv`)
  }

  const handleReset = () => {
    setTexts([""])
    setFile(null)
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Batch Analysis
          </CardTitle>
          <CardDescription>Analyze multiple texts at once or upload a file for bulk processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual Text Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Manual Text Input</h3>
              <Button variant="outline" size="sm" onClick={handleAddText} disabled={loading || texts.length >= 10}>
                <Plus className="h-4 w-4 mr-2" />
                Add Text
              </Button>
            </div>

            <div className="space-y-3">
              {texts.map((text, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    placeholder={`Text ${index + 1}...`}
                    value={text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={loading}
                  />
                  {texts.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveText(index)}
                      disabled={loading}
                      className="self-start mt-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleAnalyzeTexts}
              disabled={loading || !texts.some((text) => text.trim())}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing {texts.filter((t) => t.trim()).length} texts...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze {texts.filter((t) => t.trim()).length} Texts
                </>
              )}
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-t pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">File Upload</h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">Upload a CSV or TXT file for batch analysis</p>
                <p className="text-xs text-gray-500 mb-4">
                  CSV files should have a 'text' column. TXT files should have one text per line. Maximum 50 texts for
                  Vercel deployment.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                  <Button onClick={handleAnalyzeFile} disabled={loading} size="sm">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Analyze File"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <Button variant="outline" onClick={handleReset} disabled={loading} className="w-full bg-transparent">
            <Trash2 className="mr-2 h-4 w-4" />
            Reset All
          </Button>

          {/* Error Display */}
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          {/* Results */}
          {results && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Batch Analysis Results ({results.results.length} texts)</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExportResults}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Time: </span>
                    <span className="font-medium">{formatProcessingTime(results.total_processing_time)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average Time: </span>
                    <span className="font-medium">{formatProcessingTime(results.average_processing_time)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 truncate">{result.text}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={getSentimentColor(result.sentiment.label)}>
                            {formatSentimentLabel(result.sentiment.label)}
                          </Badge>
                          <span className="text-sm font-medium">{formatConfidence(result.confidence)}</span>
                        </div>
                      </div>

                      {result.scores && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {Object.entries(result.scores).map(([label, score]) => (
                            <div key={label} className="flex justify-between items-center text-xs">
                              <span>{formatSentimentLabel(label)}</span>
                              <span className="font-medium">{formatConfidence(score)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
