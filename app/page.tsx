"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SentimentAnalyzer } from "@/components/SentimentAnalyzer"
import { LiveTypingInference } from "@/components/LiveTypingInference"
import { BatchAnalyzer } from "@/components/BatchAnalyzer"
import { AnalysisHistory } from "@/components/AnalysisHistory"
import { ModelInfo } from "@/components/ModelInfo"
import { Brain } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Sentiment Analysis Platform</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced sentiment analysis powered by the siebert/sentiment-roberta-large-english transformer model.
            Analyze individual texts, batch process files, or get real-time insights as you type.
          </p>
        </div>

        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="analyzer">Single Analysis</TabsTrigger>
            <TabsTrigger value="live">Live Typing</TabsTrigger>
            <TabsTrigger value="batch">Batch Processing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="model">Model Info</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-6">
            <SentimentAnalyzer />
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            <LiveTypingInference />
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <BatchAnalyzer />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <AnalysisHistory />
          </TabsContent>

          <TabsContent value="model" className="space-y-6">
            <ModelInfo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
