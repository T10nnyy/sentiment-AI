"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Search, Download, Trash2, Filter } from "lucide-react"
import { useAnalysisHistory } from "@/hooks/useSentiment"
import {
  formatSentimentLabel,
  getSentimentColor,
  formatConfidence,
  formatProcessingTime,
  exportToCSV,
} from "@/lib/utils"
import type { SentimentResult } from "@/types/sentiment"

export default function AnalysisHistory() {
  const { history, loadHistory, clearHistory, removeFromHistory } = useAnalysisHistory()
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState<string>("all")
  const [filteredHistory, setFilteredHistory] = useState<SentimentResult[]>([])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    let filtered = history

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((item) => item.text.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply sentiment filter
    if (sentimentFilter !== "all") {
      filtered = filtered.filter(
        (item) => formatSentimentLabel(item.sentiment.label).toLowerCase() === sentimentFilter.toLowerCase(),
      )
    }

    setFilteredHistory(filtered)
  }, [history, searchTerm, sentimentFilter])

  const handleExportHistory = () => {
    if (filteredHistory.length === 0) return

    const exportData = filteredHistory.map((result, index) => ({
      index: index + 1,
      text: result.text,
      sentiment: formatSentimentLabel(result.sentiment.label),
      confidence: formatConfidence(result.confidence),
      processing_time: formatProcessingTime(result.processing_time),
      timestamp: new Date().toISOString(),
      ...result.scores,
    }))

    exportToCSV(exportData, `sentiment-history-${new Date().toISOString().split("T")[0]}.csv`)
  }

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all analysis history? This action cannot be undone.")) {
      clearHistory()
    }
  }

  const handleRemoveItem = (index: number) => {
    if (window.confirm("Are you sure you want to remove this item from history?")) {
      removeFromHistory(index)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Analysis History
              </CardTitle>
              <CardDescription>View and manage your previous sentiment analysis results</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {filteredHistory.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExportHistory}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
              {history.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search analysis history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredHistory.length} of {history.length} results
          </div>

          {/* History Items */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {history.length === 0 ? "No Analysis History" : "No Results Found"}
              </h3>
              <p className="text-gray-500">
                {history.length === 0
                  ? "Start analyzing text to build your history"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredHistory.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-sm text-gray-900 line-clamp-2">{result.text}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Processing: {formatProcessingTime(result.processing_time)}</span>
                          {result.scores && <span>Scores: {Object.keys(result.scores).length} labels</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={getSentimentColor(result.sentiment.label)}>
                          {formatSentimentLabel(result.sentiment.label)}
                        </Badge>
                        <span className="text-sm font-medium">{formatConfidence(result.confidence)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {result.scores && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {Object.entries(result.scores).map(([label, score]) => (
                            <div key={label} className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">{formatSentimentLabel(label)}</span>
                              <span className="font-medium">{formatConfidence(score)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
