"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { History, Search, Trash2 } from "lucide-react"

interface HistoryEntry {
  id: string
  text: string
  result: {
    label: string
    confidence: number
    processing_time: number
  }
  timestamp: Date
}

export function AnalysisHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("sentiment-analysis-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        const historyWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
        setHistory(historyWithDates)
      } catch (error) {
        console.error("Failed to load history:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Filter history based on search term
    const filtered = history.filter(
      (entry) =>
        entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.result.label.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredHistory(filtered)
  }, [history, searchTerm])

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("sentiment-analysis-history")
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

  const formatDate = (date: Date) => {
    return date.toLocaleString()
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Analysis History
        </CardTitle>
        <CardDescription>View and search your previous sentiment analysis results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={clearHistory} disabled={history.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {history.length === 0 ? (
              <p>No analysis history yet. Start analyzing some text!</p>
            ) : (
              <p>No results found for "{searchTerm}"</p>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredHistory.map((entry) => (
              <div key={entry.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{entry.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(entry.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getSentimentColor(entry.result.label)}>{entry.result.label}</Badge>
                    <span className="text-xs font-mono text-gray-500">
                      {(entry.result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Showing {filteredHistory.length} of {history.length} entries
          </div>
        )}
      </CardContent>
    </Card>
  )
}
