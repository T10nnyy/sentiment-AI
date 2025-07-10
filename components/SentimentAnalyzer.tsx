"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useSentiment } from "@/hooks/useSentiment"
import { Loader2, Send, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import type { SentimentResult } from "@/types/sentiment"

export default function SentimentAnalyzer() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<SentimentResult | null>(null)
  const { analyzeSentiment, loading } = useSentiment()

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze")
      return
    }

    try {
      const analysis = await analyzeSentiment(text)
      setResult(analysis)
      toast.success("Analysis completed successfully!")
    } catch (error) {
      toast.error("Failed to analyze sentiment")
      console.error("Analysis error:", error)
    }
  }

  const handleReset = () => {
    setText("")
    setResult(null)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      case "neutral":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Textarea
          placeholder="Enter text to analyze sentiment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="resize-none"
        />

        <div className="flex gap-2">
          <Button onClick={handleAnalyze} disabled={loading || !text.trim()} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Analyze Sentiment
              </>
            )}
          </Button>

          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Analysis Result
              <Badge variant={getSentimentBadgeVariant(result.sentiment)}>{result.sentiment}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Confidence</span>
                <span className="text-sm text-muted-foreground">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.confidence * 100} className="h-2" />
            </div>

            {result.scores && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Detailed Scores</h4>
                {Object.entries(result.scores).map(([sentiment, score]) => (
                  <div key={sentiment} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{sentiment}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getSentimentColor(sentiment)}`}
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{(score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground">Model: siebert/sentiment-roberta-large-english</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
