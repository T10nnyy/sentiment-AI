"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Keyboard, Zap, ThumbsUp, ThumbsDown, Minus } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { useSentiment } from "@/hooks/useSentiment"
import type { SentimentResult } from "@/lib/api"

export default function LiveTypingInference() {
  const [text, setText] = useState("")
  const [isEnabled, setIsEnabled] = useState(true)
  const [result, setResult] = useState<SentimentResult | null>(null)
  const debouncedText = useDebounce(text, 500)
  const { analyzeSentiment, loading } = useSentiment()

  useEffect(() => {
    if (debouncedText.trim() && isEnabled && debouncedText.length > 10) {
      analyzeSentiment(debouncedText).then(setResult).catch(console.error)
    } else {
      setResult(null)
    }
  }, [debouncedText, isEnabled, analyzeSentiment])

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Live Typing Inference
              </CardTitle>
              <CardDescription>Real-time sentiment analysis as you type (minimum 10 characters)</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="live-mode" checked={isEnabled} onCheckedChange={setIsEnabled} />
              <Label htmlFor="live-mode">Live Analysis</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Start typing to see real-time sentiment analysis..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>{text.length}/2000 characters</span>
              {loading && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-pulse text-blue-500" />
                  <span>Analyzing...</span>
                </div>
              )}
            </div>
          </div>

          {!isEnabled && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                Live analysis is disabled. Toggle the switch above to enable real-time inference.
              </p>
            </div>
          )}

          {text.length > 0 && text.length <= 10 && isEnabled && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                Type at least 10 characters to start live analysis...
              </p>
            </div>
          )}

          {result && isEnabled && (
            <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getSentimentIcon(result.sentiment.label)}
                  Live Analysis Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Sentiment:</span>
                  <Badge className={getSentimentColor(result.sentiment.label)}>{result.sentiment.label}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Confidence:</span>
                  <span className="font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                </div>

                <div className="space-y-1">
                  <Progress value={result.confidence * 100} className="h-2" />
                </div>

                <div className="text-xs text-muted-foreground">
                  Analysis time: {(result.processing_time * 1000).toFixed(0)}ms
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Live Typing Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400">
              1
            </div>
            <div>
              <p className="font-medium">Type Your Text</p>
              <p className="text-sm text-muted-foreground">
                Start typing in the text area above (minimum 10 characters required)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400">
              2
            </div>
            <div>
              <p className="font-medium">Automatic Analysis</p>
              <p className="text-sm text-muted-foreground">
                The system waits 500ms after you stop typing, then analyzes your text
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400">
              3
            </div>
            <div>
              <p className="font-medium">Real-time Results</p>
              <p className="text-sm text-muted-foreground">
                See sentiment analysis results update in real-time as you modify your text
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
