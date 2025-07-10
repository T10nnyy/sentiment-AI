"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, MessageSquare, RotateCcw, ThumbsUp, ThumbsDown, Minus } from "lucide-react"
import { useSentiment } from "@/hooks/useSentiment"
import type { SentimentResult } from "@/lib/api"

export default function SentimentAnalyzer() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<SentimentResult | null>(null)
  const { analyzeSentiment, loading, error } = useSentiment()

  const handleAnalyze = async () => {
    if (!text.trim()) return

    try {
      const analysisResult = await analyzeSentiment(text)
      setResult(analysisResult)
    } catch (err) {
      console.error("Analysis failed:", err)
    }
  }

  const handleReset = () => {
    setText("")
    setResult(null)
  }

  const getSentimentIcon = (label: string) => {
    switch (label.toUpperCase()) {
      case "POSITIVE":
        return <ThumbsUp className="w-5 h-5 text-green-500" />
      case "NEGATIVE":
        return <ThumbsDown className="w-5 h-5 text-red-500" />
      default:
        return <Minus className="w-5 h-5 text-gray-500" />
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

  const examples = [
    "I absolutely love this product! It exceeded all my expectations.",
    "This service was terrible and completely disappointing.",
    "The weather is nice today.",
    "I'm frustrated with the poor quality and slow delivery.",
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Sentiment Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Analyze the emotional tone of any text using our advanced AI model powered by
          siebert/sentiment-roberta-large-english.
        </p>
      </div>

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Text Analysis
          </CardTitle>
          <CardDescription>Enter your text below to analyze its sentiment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Enter your text here to analyze its sentiment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="text-sm text-muted-foreground mt-1">{text.length}/2000 characters</div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-400 font-medium">Error</p>
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={!text.trim() || loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Analyze Sentiment
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={!text && !result}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getSentimentIcon(result.sentiment.label)}
              Analysis Results
            </CardTitle>
            <CardDescription>Analysis completed in {(result.processing_time * 1000).toFixed(0)}ms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Sentiment:</span>
              <Badge className={getSentimentColor(result.sentiment.label)}>{result.sentiment.label}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Confidence:</span>
              <span className="text-lg font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Confidence Score:</span>
                <span className="font-medium">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.confidence * 100} className="h-2" />
            </div>

            {result.scores && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Detailed Scores:</h4>
                <div className="space-y-2">
                  {Object.entries(result.scores).map(([label, score]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{label}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={score * 100} className="h-1 w-20" />
                        <span className="font-medium w-12 text-right">{(score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Analyzed text: "{result.text.substring(0, 100)}
                {result.text.length > 100 ? "..." : ""}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Try These Examples</CardTitle>
          <CardDescription>Click on any example to analyze it quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setText(example)}
                className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">{example}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
