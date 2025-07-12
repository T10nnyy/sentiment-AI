"use client"

/**
 * Batch sentiment analysis component
 */

import React, { useState, useRef } from "react"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Download, Trash2, Plus, TrendingUp, TrendingDown, BarChart3, FileText } from "lucide-react"
import toast from "react-hot-toast"

import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Textarea from "@/components/ui/Textarea"
import { useBatchPrediction, useSentimentFile } from "@/hooks/useSentiment"
import type { SentimentResult } from "@/types/sentiment"

// Form validation schema
const batchSchema = z.object({
  texts: z.array(z.string().min(1, "Text cannot be empty")).min(1, "Add at least one text"),
})

type BatchFormData = z.infer<typeof batchSchema>

interface BatchResult {
  text: string
  result: SentimentResult
  index: number
}

const BatchAnalyzer: React.FC = () => {
  const [texts, setTexts] = useState<string[]>([""])
  const [results, setResults] = useState<BatchResult[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const batchPrediction = useBatchPrediction()
  const fileAnalysis = useSentimentFile()

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.txt'))) {
      setFile(selectedFile)
      setResults([])
    } else {
      toast.error('Please select a CSV or TXT file')
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

  const addTextInput = () => {
    setTexts([...texts, ""])
  }

  const removeTextInput = (index: number) => {
    if (texts.length > 1) {
      const newTexts = texts.filter((_, i) => i !== index)
      setTexts(newTexts)
    }
  }

  const updateText = (index: number, value: string) => {
    const newTexts = [...texts]
    newTexts[index] = value
    setTexts(newTexts)
  }

  const handleAnalyze = async () => {
    if (file) {
      // Handle file analysis
      try {
        const response = await fileAnalysis.mutateAsync(file)
        const batchResults: BatchResult[] = response.results.map((result, index) => ({
          text: `Text ${index + 1}`,
          result: {
            label: result.label,
            score: result.score,
          },
          index,
        }))
        setResults(batchResults)
        toast.success(`Analyzed file with ${response.results.length} texts successfully!`)
      } catch (error) {
        console.error("File analysis failed:", error)
        toast.error("File analysis failed. Please try again.")
      }
    } else {
      // Handle manual text input analysis
      const validTexts = texts.filter((text) => text.trim().length > 0)

      if (validTexts.length === 0) {
        toast.error("Please enter at least one text to analyze")
        return
      }

      try {
        const results = await batchPrediction.mutateAsync(validTexts)
        const batchResults: BatchResult[] = results.map((result, index) => ({
          text: validTexts[index],
          result,
          index,
        }))
        setResults(batchResults)
        toast.success(`Analyzed ${results.length} texts successfully!`)
      } catch (error) {
        console.error("Batch analysis failed:", error)
      }
    }
  }

  const clearAll = () => {
    setTexts([""])
    setResults([])
    setFile(null)
  }

  const exportResults = () => {
    if (results.length === 0) {
      toast.error("No results to export")
      return
    }

    const csvContent = [
      ["Text", "Sentiment", "Confidence Score"],
      ...results.map(({ text, result }) => [`"${text.replace(/"/g, '""')}"`, result.label, result.score.toFixed(4)]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sentiment-analysis-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Results exported successfully!")
  }

  const getSentimentColor = (label: string) => {
    return label === "positive" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  }

  const getSentimentIcon = (label: string) => {
    return label === "positive" ? TrendingUp : TrendingDown
  }

  const getSentimentBg = (label: string) => {
    return label === "positive"
      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
  }

  const getOverallStats = () => {
    if (results.length === 0) return null

    const positive = results.filter((r) => r.result.label === "positive").length
    const negative = results.length - positive
    const avgConfidence = results.reduce((sum, r) => sum + r.result.score, 0) / results.length

    return { positive, negative, avgConfidence, total: results.length }
  }

  const stats = getOverallStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-4"
        >
          <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Batch Analysis</h1>
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Analyze multiple texts at once for efficient sentiment analysis. Perfect for processing customer reviews,
          feedback, or social media posts.
        </p>
      </div>

      {/* Input Section */}
      <Card className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {/* File Upload Section */}
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
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your file here, or click to select
            </p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Select File
            </Button>
            <input
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

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Or Enter Texts Manually ({texts.filter((t) => t.trim()).length})
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addTextInput}
                icon={<Plus className="w-4 h-4 bg-transparent" />}
              >
                Add Text
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} icon={<Trash2 className="w-4 h-4" />}>
                Clear All
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {texts.map((text, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-3"
              >
                <div className="flex-1">
                  <Textarea
                    value={text}
                    onChange={(e) => updateText(index, e.target.value)}
                    placeholder={`Text ${index + 1}...`}
                    rows={2}
                  />
                </div>
                {texts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTextInput(index)}
                    icon={<Trash2 className="w-4 h-4" />}
                    className="mt-2"
                  >
                    Remove
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleAnalyze}
              loading={batchPrediction.isLoading}
              icon={<Upload className="w-4 h-4" />}
              size="lg"
              disabled={texts.filter((t) => t.trim()).length === 0}
            >
              {batchPrediction.isLoading ? "Analyzing..." : "Analyze All Texts"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Stats Overview */}
            {stats && (
              <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.positive}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.negative}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {(stats.avgConfidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={exportResults}
                    icon={<Download className="w-4 h-4 bg-transparent" />}
                  >
                    Export Results (CSV)
                  </Button>
                </div>
              </Card>
            )}

            {/* Individual Results */}
            <Card padding="none">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analysis Results</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map(({ text, result, index }) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center mb-2">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Text {index + 1}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{text}</p>
                      </div>

                      <div
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${getSentimentBg(result.label)}`}
                      >
                        {React.createElement(getSentimentIcon(result.label), {
                          className: `w-5 h-5 ${getSentimentColor(result.label)}`,
                        })}
                        <div className="text-right">
                          <div className={`font-semibold ${getSentimentColor(result.label)}`}>
                            {result.label.charAt(0).toUpperCase() + result.label.slice(1)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {(result.score * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BatchAnalyzer
