"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, FileText, History, Info } from "lucide-react"
import SentimentAnalyzer from "@/components/SentimentAnalyzer"
import LiveTypingInference from "@/components/LiveTypingInference"
import BatchAnalyzer from "@/components/BatchAnalyzer"
import AnalysisHistory from "@/components/AnalysisHistory"
import ModelInfo from "@/components/ModelInfo"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("analyzer")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Sentiment Analysis Platform</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Advanced AI-powered sentiment analysis using Cardiff NLP's Twitter RoBERTa model
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-white">
              <Zap className="h-3 w-3 mr-1" />
              Real-time Analysis
            </Badge>
            <Badge variant="outline" className="bg-white">
              <FileText className="h-3 w-3 mr-1" />
              Batch Processing
            </Badge>
            <Badge variant="outline" className="bg-white">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Choose Your Analysis Method</CardTitle>
            <CardDescription>Select from different analysis modes to suit your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="analyzer" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Analyzer</span>
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Live Typing</span>
                </TabsTrigger>
                <TabsTrigger value="batch" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Batch</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Model Info</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="analyzer" className="space-y-4">
                  <SentimentAnalyzer />
                </TabsContent>

                <TabsContent value="live" className="space-y-4">
                  <LiveTypingInference />
                </TabsContent>

                <TabsContent value="batch" className="space-y-4">
                  <BatchAnalyzer />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <AnalysisHistory />
                </TabsContent>

                <TabsContent value="info" className="space-y-4">
                  <ModelInfo />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">Powered by Cardiff NLP's Twitter RoBERTa model • Optimized for Vercel deployment</p>
        </div>
      </div>
    </div>
  )
}
