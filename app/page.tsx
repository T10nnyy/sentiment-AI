"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Zap, FileText, History, Brain, Github, ExternalLink } from "lucide-react"
import SentimentAnalyzer from "@/components/SentimentAnalyzer"
import LiveTypingInference from "@/components/LiveTypingInference"
import BatchAnalyzer from "@/components/BatchAnalyzer"
import AnalysisHistory from "@/components/AnalysisHistory"
import ModelInfo from "@/components/ModelInfo"

export default function Home() {
  const [activeTab, setActiveTab] = useState("analyze")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sentiment Analysis AI
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Advanced sentiment analysis powered by{" "}
            <Badge variant="secondary" className="mx-1">
              siebert/sentiment-roberta-large-english
            </Badge>
            transformer model
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a
              href="https://huggingface.co/siebert/sentiment-roberta-large-english"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              View Model on Hugging Face
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              <Github className="w-4 h-4" />
              Source Code
            </a>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Live Typing
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Batch
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="model" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Model Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <SentimentAnalyzer />
          </TabsContent>

          <TabsContent value="live">
            <LiveTypingInference />
          </TabsContent>

          <TabsContent value="batch">
            <BatchAnalyzer />
          </TabsContent>

          <TabsContent value="history">
            <AnalysisHistory />
          </TabsContent>

          <TabsContent value="model">
            <ModelInfo />
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <CardTitle className="text-lg">Real-time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Instant sentiment detection with confidence scores and detailed results
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <CardTitle className="text-lg">Live Typing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  See sentiment analysis update in real-time as you type your text
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <CardTitle className="text-lg">Batch Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Analyze multiple texts at once or upload CSV/TXT files for bulk analysis
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <History className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <CardTitle className="text-lg">Analysis History</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Keep track of all your analyses with search, filter, and export capabilities
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by{" "}
            <a
              href="https://huggingface.co/siebert/sentiment-roberta-large-english"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              siebert/sentiment-roberta-large-english
            </a>{" "}
            • Built with Next.js, FastAPI, and Transformers
          </p>
        </footer>
      </div>
    </div>
  )
}
