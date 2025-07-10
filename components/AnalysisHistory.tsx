"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAnalysisHistory } from "@/hooks/useSentiment"
import { Search, Trash2, Download, Filter } from "lucide-react"
import { toast } from "sonner"

export default function AnalysisHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const { history, loading, clearHistory, deleteItem, exportHistory } = useAnalysisHistory()

  const filteredHistory = history
    .filter((item) => {
      const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSentiment = sentimentFilter === "all" || item.sentiment.toLowerCase() === sentimentFilter
      return matchesSearch && matchesSentiment
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "confidence":
          return b.confidence - a.confidence
        case "text":
          return a.text.localeCompare(b.text)
        default:
          return 0
      }
    })

  const handleClearHistory = async () => {
    try {
      await clearHistory()
      toast.success("History cleared successfully")
    } catch (error) {
      toast.error("Failed to clear history")
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id)
      toast.success("Item deleted successfully")
    } catch (error) {
      toast.error("Failed to delete item")
    }
  }

  const handleExport = async () => {
    try {
      await exportHistory()
      toast.success("History exported successfully")
    } catch (error) {
      toast.error("Failed to export history")
    }
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search analysis history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="confidence">Confidence</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {filteredHistory.length} of {history.length} items
        </p>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearHistory}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Filter className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">
              {history.length === 0
                ? "No analysis history yet. Start analyzing some text!"
                : "No items match your current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-2 line-clamp-2">{item.text}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDate(item.timestamp)}</span>
                      <span>Confidence: {(item.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={getSentimentBadgeVariant(item.sentiment)}>{item.sentiment}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
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
