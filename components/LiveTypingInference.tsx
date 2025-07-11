"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, Zap } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { useSentimentPrediction } from "@/hooks/useSentiment"
import {
  formatSentimentLabel,
  getSentimentColor,
  formatConfidence,
  isLiveTypingEnabled,
  getDebounceDelay,
} from "@/lib/utils"

export default function LiveTypingInference() {
  const [text, setText] = useState("")
  const [enabled, setEnabled] = useState(isLiveTypingEnabled())
  const debouncedText = useDebounce(text, getDebounceDelay())
  const { result, loading, error, predict } = useSentimentPrediction()

  useEffect(() => {
    if (enabled && debouncedText.trim() && debouncedText.length > 10) {
      predict(debouncedText)
    }
  }, [debouncedText, enabled, predict])

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    if (!checked) {
      setText("")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Live Typing Inference
              </CardTitle>
              <CardDescription>Get real-time sentiment analysis as you type (minimum 10 characters)</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="live-mode" className="text-sm font-medium">
                Live Mode
              </label>
              <Switch id="live-mode" checked={enabled} onCheckedChange={handleToggle} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="live-text-input" className="text-sm font-medium">
              Type your text
            </label>
            <Textarea
              id="live-text-input"
              placeholder={enabled ? "Start typing to see live sentiment analysis..." : "Enable live mode to start"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={!enabled}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{text.length} characters</span>
              {enabled && text.length > 0 && text.length < 10 && (
                <span className="text-amber-600">{10 - text.length} more characters needed for analysis</span>
              )}
            </div>
          </div>

          {enabled && (
            <>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}

              {result && !loading && (
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Live Analysis Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Sentiment</label>
                        <Badge className={getSentimentColor(result.sentiment.label)}>
                          {formatSentimentLabel(result.sentiment.label)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Confidence</label>
                        <div className="text-lg font-semibold">{formatConfidence(result.confidence)}</div>
                      </div>
                    </div>

                    {result.scores && (
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Score Breakdown</label>
                        <div className="space-y-1">
                          {Object.entries(result.scores).map(([label, score]) => (
                            <div key={label} className="flex items-center justify-between">
                              <span className="text-sm">{formatSentimentLabel(label)}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${score * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{formatConfidence(score)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!enabled && (
            <div className="p-4 text-center text-muted-foreground bg-gray-50 rounded-md">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Enable live mode to get real-time sentiment analysis as you type</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
