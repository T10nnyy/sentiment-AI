"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  Trash2,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  History,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SentimentResult } from "@/types/sentiment"

interface HistoryItem extends SentimentResult {
  id: string
  timestamp: Date
}

export function AnalysisHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("sentiment_analysis_history")
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

  // Filter and sort history
  useEffect(() => {
    let filtered = [...history]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) => item.text.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply sentiment filter
    if (sentimentFilter !== "all") {
      filtered = filtered.filter((item) => item.sentiment.toLowerCase() === sentimentFilter.toLowerCase())
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp.getTime() - a.timestamp.getTime()
        case "oldest":
          return a.timestamp.getTime() - b.timestamp.getTime()
        case "confidence":
          return b.confidence - a.confidence
        case "text":
          return a.text.localeCompare(b.text)
        default:
          return 0
      }
    })

    setFilteredHistory(filtered)
  }, [history, searchTerm, sentimentFilter, sortBy])

  // Save analysis to history
  const saveToHistory = (result: SentimentResult) => {
    const historyItem: HistoryItem = {
      ...result,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    const updatedHistory = [historyItem, ...history].slice(0, 100) // Keep only last 100 items
    setHistory(updatedHistory)
    localStorage.setItem("sentiment_analysis_history", JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("sentiment_analysis_history")
  }

  const deleteItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("sentiment_analysis_history", JSON.stringify(updatedHistory))
  }

  const exportHistory = () => {
    if (filteredHistory.length === 0) return

    const csvContent = [
      ["Timestamp", "Text", "Sentiment", "Confidence", "Positive Score", "Negative Score"],
      ...filteredHistory.map((item) => [
        item.timestamp.toISOString(),
        `"${item.text.replace(/"/g, '""')}"`,
        item.sentiment,
        (item.confidence * 100).toFixed(2),
        ((item.scores?.positive || 0) * 100).toFixed(2),
        ((item.scores?.negative || 0) * 100).toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sentiment_history_${new Date().toISOString().split("T")[0]}.csv`
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

  const getStats = () => {
    const positive = history.filter((item) => item.sentiment.toLowerCase() === "positive").length
    const negative = history.filter((item) => item.sentiment.toLowerCase() === "negative").length
    const avgConfidence =
      history.length > 0 ? history.reduce((sum, item) => sum + item.confidence, 0) / history.length : 0

    return { positive, negative, total: history.length, avgConfidence }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Analysis History
          </CardTitle>
          <CardDescription>View and manage your sentiment analysis history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Analyses</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
              <div className="text-sm text-green-600">Positive</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
              <div className="text-sm text-red-600">Negative</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{(stats.avgConfidence * 100).toFixed(1)}%</div>
              <div className="text-sm text-purple-600">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
                <SelectItem value="text">Text A-Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={exportHistory} variant="outline" disabled={filteredHistory.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={clearHistory} variant="outline" disabled={history.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No analysis history</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {history.length === 0
                  ? "Start analyzing text to build your history"
                  : "No results match your current filters"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{item.timestamp.toLocaleString()}</span>
                    </div>

                    <p className="text-sm">
                      {item.text.length > 200 ? `${item.text.substring(0, 200)}...` : item.text}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Confidence: {(item.confidence * 100).toFixed(1)}%</span>
                      {item.scores && (
                        <>
                          <span>Positive: {((item.scores.positive || 0) * 100).toFixed(1)}%</span>
                          <span>Negative: {((item.scores.negative || 0) * 100).toFixed(1)}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`${getSentimentColor(item.sentiment)} text-white flex items-center gap-1`}>
                      {getSentimentIcon(item.sentiment)}
                      {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
