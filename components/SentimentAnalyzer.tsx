"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare } from "lucide-react"
import { useSentiment } from "@/hooks/useSentiment"

export function SentimentAnalyzer() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<any>(null)
  const { loading, error, analyzeSentiment } = useSentiment()

  const handleAnalyze = async () => {
    if (!text.trim()) return

    const sentimentResult = await analyzeSentiment(text)
    if (sentimentResult) {
      setResult(sentimentResult)
    }
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

  const formatConfidence = (score: number) => {
    return `${(score * 100).toFixed(1)}%`
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Sentiment Analysis
        </CardTitle>
        <CardDescription>
          Analyze the sentiment of your text using the siebert/sentiment-roberta-large-english model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="text-input" className="text-sm font-medium">
            Enter text to analyze
          </label>
          <Textarea
            id="text-input"
            placeholder="Type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <Button onClick={handleAnalyze} disabled={loading || !text.trim()} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Sentiment"
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sentiment:</span>
              <Badge className={getSentimentColor(result.label)}>{result.label}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Confidence:</span>
              <span className="text-sm font-mono">{formatConfidence(result.confidence)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing Time:</span>
              <span className="text-sm font-mono">{(result.processing_time * 1000).toFixed(1)}ms</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
