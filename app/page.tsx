"use client"
import { ApolloProvider } from "@apollo/client"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { apolloClient } from "@/lib/apollo"
import SentimentAnalyzer from "@/components/SentimentAnalyzer"
import BatchAnalyzer from "@/components/BatchAnalyzer"
import AnalysisHistory from "@/components/AnalysisHistory"
import ModelInfo from "@/components/ModelInfo"
import LiveTypingInference from "@/components/LiveTypingInference"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, History, Upload, Info, Zap } from "lucide-react"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ApolloProvider client={apolloClient}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Sentiment Analysis Platform</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Powered by the siebert/sentiment-roberta-large-english transformer model for accurate sentiment analysis
              </p>
            </div>

            <Tabs defaultValue="analyze" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="analyze" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Analyze
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Live Typing
                </TabsTrigger>
                <TabsTrigger value="batch" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Batch
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="model" className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Model Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analyze">
                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SentimentAnalyzer />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="live">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Typing Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LiveTypingInference />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="batch">
                <Card>
                  <CardHeader>
                    <CardTitle>Batch Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BatchAnalyzer />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnalysisHistory />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="model">
                <Card>
                  <CardHeader>
                    <CardTitle>Model Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModelInfo />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Toaster />
      </ApolloProvider>
    </ThemeProvider>
  )
}
