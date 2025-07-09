"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Brain, BarChart3, History, Settings } from "lucide-react"
import { SentimentAnalyzer } from "../frontend/components/SentimentAnalyzer"
import { BatchAnalyzer } from "../frontend/components/BatchAnalyzer"
import { AnalysisHistory } from "../frontend/components/AnalysisHistory"
import { ModelInfo } from "../frontend/components/ModelInfo"
import { LiveTypingInference } from "../frontend/components/LiveTypingInference"
import { ApolloProvider } from "@apollo/client"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "next-themes"
import Layout from "../components/Layout"
import { apolloClient } from "../lib/apollo"
import { QueryClient, QueryClientProvider } from "react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function Home() {
  const [activeTab, setActiveTab] = useState("analyze")

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
              <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Brain className="h-8 w-8 text-blue-600" />
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Sentiment Analysis Platform</h1>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Advanced AI-powered sentiment analysis with real-time processing, batch operations, and
                    comprehensive analytics
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Badge variant="secondary">
                      <Brain className="h-3 w-3 mr-1" />
                      Transformer Models
                    </Badge>
                    <Badge variant="secondary">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Real-time Analysis
                    </Badge>
                    <Badge variant="secondary">
                      <History className="h-3 w-3 mr-1" />
                      Batch Processing
                    </Badge>
                  </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-8">
                    <TabsTrigger value="analyze" className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Analyze
                    </TabsTrigger>
                    <TabsTrigger value="live" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Live Typing
                    </TabsTrigger>
                    <TabsTrigger value="batch" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Batch
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      History
                    </TabsTrigger>
                    <TabsTrigger value="models" className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Models
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="analyze" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Text Sentiment Analysis
                        </CardTitle>
                        <CardDescription>
                          Analyze the sentiment of any text using our advanced AI models
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SentimentAnalyzer />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="live" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Live Typing Analysis
                        </CardTitle>
                        <CardDescription>Get real-time sentiment feedback as you type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <LiveTypingInference />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="batch" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Batch Processing
                        </CardTitle>
                        <CardDescription>Process multiple texts or upload files for bulk analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <BatchAnalyzer />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Analysis History
                        </CardTitle>
                        <CardDescription>View and manage your previous sentiment analyses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AnalysisHistory />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="models" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Model Information
                        </CardTitle>
                        <CardDescription>Learn about the AI models powering our sentiment analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ModelInfo />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Layout>
          <Toaster position="top-right" />
        </ThemeProvider>
      </ApolloProvider>
    </QueryClientProvider>
  )
}
