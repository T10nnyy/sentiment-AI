"use client"
import { ApolloProvider } from "@apollo/client"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { client } from "@/lib/apollo"
import { SentimentAnalyzer } from "@/components/SentimentAnalyzer"
import { LiveTypingInference } from "@/components/LiveTypingInference"
import { BatchAnalyzer } from "@/components/BatchAnalyzer"
import { AnalysisHistory } from "@/components/AnalysisHistory"
import { ModelInfo } from "@/components/ModelInfo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ApolloProvider client={client}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Sentiment Analysis Microservice</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Powered by siebert/sentiment-roberta-large-english
              </p>
            </div>

            <Tabs defaultValue="analyzer" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
                <TabsTrigger value="live">Live Typing</TabsTrigger>
                <TabsTrigger value="batch">Batch Process</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="model">Model Info</TabsTrigger>
              </TabsList>

              <TabsContent value="analyzer" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Analysis</CardTitle>
                    <CardDescription>Analyze the sentiment of your text using our advanced AI model</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SentimentAnalyzer />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="live" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Typing Analysis</CardTitle>
                    <CardDescription>Get real-time sentiment analysis as you type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LiveTypingInference />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="batch" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Batch Processing</CardTitle>
                    <CardDescription>Upload and analyze multiple texts at once</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BatchAnalyzer />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis History</CardTitle>
                    <CardDescription>View and manage your previous analyses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnalysisHistory />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="model" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Model Information</CardTitle>
                    <CardDescription>Details about the sentiment analysis model</CardDescription>
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
