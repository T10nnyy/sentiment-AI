"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { History, Search, Filter, Trash2, Download, ThumbsUp, ThumbsDown, Minus, Calendar } from "lucide-react"
import type { SentimentResult } from "@/lib/api"

interface AnalysisHistoryItem extends SentimentResult {
  id: string
  timestamp: Date
}

export default function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSentiment, setFilterSentiment] = useState<string>("all")

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("sentiment-analysis-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setHistory(parsed)
      } catch (error) {
        console.error("Failed to load history:", error)
      }
    }
  }, [])

  const saveHistory = (newHistory: AnalysisHistoryItem[]) => {
    setHistory(newHistory)
    localStorage.setItem("sentiment-analysis-history", JSON.stringify(newHistory))
  }

  const addToHistory = (result: SentimentResult) => {
    const newItem: AnalysisHistoryItem = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    const newHistory = [newItem, ...history].slice(0, 100) // Keep only last 100 items
    saveHistory(newHistory)
  }

  const clearHistory = () => {
    saveHistory([])
  }

  const deleteItem = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id)
    saveHistory(newHistory)
  }

  const exportHistory = () => {
    const csvContent = [
      ["Timestamp", "Text", "Sentiment", "Confidence", "Score"].join(","),
      ...filteredHistory.map((item) =>
        [
          item.timestamp.toISOString(),
          `"${item.text.replace(/"/g, '""')}"`,
          item.sentiment.label,
          (item.confidence * 100).toFixed(2) + "%",
          item.sentiment.score.toFixed(4),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sentiment-history-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterSentiment === "all" || item.sentiment.label.toLowerCase() === filterSentiment.toLowerCase()
    return matchesSearch && matchesFilter
  })

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

  // Expose addToHistory function globally for other components to use
  useEffect(() => {
    ;(window as any).addToSentimentHistory = addToHistory
  }, [history])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Analysis History
              </CardTitle>
              <CardDescription>
                View and manage your previous sentiment analyses ({history.length} total)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {history.length > 0 && (
                <>
                  <Button variant="outline" onClick={exportHistory}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={clearHistory}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search analysis history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>

          {/* Statistics */}
          {history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{history.length}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {history.filter((h) => h.sentiment.label.toUpperCase() === "POSITIVE").length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Positive</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {history.filter((h) => h.sentiment.label.toUpperCase() === "NEGATIVE").length}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">Negative</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {history.filter((h) => !["POSITIVE", "NEGATIVE"].includes(h.sentiment.label.toUpperCase())).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Neutral</div>
              </div>
            </div>
          )}

          <Separator />

          {/* History Items */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {history.length === 0 ? "No Analysis History" : "No Results Found"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {history.length === 0
                  ? "Start analyzing text to build your history."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredHistory.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm flex-1">{item.text}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(item.sentiment.label)}
                      <Badge className={getSentimentColor(item.sentiment.label)}>{item.sentiment.label}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {(item.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
