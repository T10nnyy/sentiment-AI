"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useSentiment } from "@/hooks/useSentiment"
import { useDebounce } from "@/hooks/useDebounce"
import { Zap, Loader2 } from "lucide-react"
import type { SentimentResult } from "@/types/sentiment"

export default function LiveTypingInference() {
  const [text, setText] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [result, setResult] = useState<SentimentResult | null>(null)
  const debouncedText = useDebounce(text, 500)
  const { analyzeSentiment, loading } = useSentiment()

  useEffect(() => {
    if (enabled && debouncedText.trim() && debouncedText.length > 10) {
      analyzeSentiment(debouncedText).then(setResult).catch(console.error)
    } else {
      setResult(null)
    }
  }, [debouncedText, enabled, analyzeSentiment])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      case "neutral":
        return "text-gray-600"
      default:
        return "text-blue-600"
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
      <div className="flex items-center space-x-2">
        <Switch id="live-mode" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="live-mode" className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Live Analysis Mode
        </Label>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      </div>

      <Textarea
        placeholder="Start typing to see live sentiment analysis... (minimum 10 characters)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="resize-none"
      />

      <div className="text-sm text-muted-foreground">
        Characters: {text.length} | Words: {text.trim().split(/\s+/).filter(Boolean).length}
      </div>

      {result && enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Live Analysis
              </span>
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
              <div className="grid grid-cols-3 gap-4 text-center">
                {Object.entries(result.scores).map(([sentiment, score]) => (
                  <div key={sentiment} className="space-y-1">
                    <div className={`text-lg font-semibold ${getSentimentColor(sentiment)}`}>
                      {(score * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">{sentiment}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center">
              Updates automatically as you type • Model: siebert/sentiment-roberta-large-english
            </div>
          </CardContent>
        </Card>
      )}

      {!enabled && (
        <Card>
          <CardContent className="text-center py-8">
            <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">
              Enable live analysis mode to see real-time sentiment analysis as you type
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
