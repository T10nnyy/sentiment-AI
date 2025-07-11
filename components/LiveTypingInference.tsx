"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Zap, Loader2 } from "lucide-react"
import { useSentiment } from "@/hooks/useSentiment"
import { useDebounce } from "@/hooks/useDebounce"

export function LiveTypingInference() {
  const [text, setText] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [result, setResult] = useState<any>(null)
  const { loading, analyzeSentiment } = useSentiment()
  const debouncedText = useDebounce(text, 500)

  useEffect(() => {
    if (enabled && debouncedText.trim() && debouncedText.length > 10) {
      analyzeSentiment(debouncedText).then((sentimentResult) => {
        if (sentimentResult) {
          setResult(sentimentResult)
        }
      })
    } else {
      setResult(null)
    }
  }, [debouncedText, enabled, analyzeSentiment])

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Live Typing Inference
        </CardTitle>
        <CardDescription>Real-time sentiment analysis as you type (minimum 10 characters)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="live-mode" checked={enabled} onCheckedChange={setEnabled} />
          <Label htmlFor="live-mode">Enable live analysis</Label>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Start typing to see live sentiment analysis..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={!enabled}
          />
          <div className="text-xs text-gray-500">
            Characters: {text.length} {text.length < 10 && text.length > 0 && "(minimum 10 for analysis)"}
          </div>
        </div>

        {enabled && text.length >= 10 && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Live Analysis:</span>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>

            {result && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sentiment:</span>
                  <Badge className={getSentimentColor(result.label)}>{result.label}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence:</span>
                  <span className="text-sm font-mono">{(result.confidence * 100).toFixed(1)}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
