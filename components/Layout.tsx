"use client"

import type React from "react"
import { useState } from "react"
import { Settings, Brain, History, FileText, Zap, BarChart3 } from "lucide-react"
import SentimentAnalyzer from "./SentimentAnalyzer"
import BatchAnalyzer from "./BatchAnalyzer"
import AnalysisHistory from "./AnalysisHistory"
import ModelInfo from "./ModelInfo"
import LiveTypingInference from "./LiveTypingInference"
import { Button } from "@/components/ui/button"
import { useSentimentStore } from "@/lib/store"

type TabType = "analyzer" | "batch" | "history" | "model" | "live"

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("analyzer")
  const { useGraphQL, enableLiveTyping, toggleGraphQL, toggleLiveTyping } = useSentimentStore()

  const tabs = [
    { id: "analyzer" as TabType, label: "Analyzer", icon: Brain },
    { id: "live" as TabType, label: "Live Typing", icon: Zap },
    { id: "batch" as TabType, label: "Batch", icon: FileText },
    { id: "history" as TabType, label: "History", icon: History },
    { id: "model" as TabType, label: "Model Info", icon: BarChart3 },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "analyzer":
        return <SentimentAnalyzer />
      case "batch":
        return <BatchAnalyzer />
      case "history":
        return <AnalysisHistory />
      case "model":
        return <ModelInfo />
      case "live":
        return <LiveTypingInference />
      default:
        return <SentimentAnalyzer />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant={useGraphQL ? "default" : "outline"} size="sm" onClick={toggleGraphQL}>
                {useGraphQL ? "GraphQL" : "REST"}
              </Button>

              <Button variant={enableLiveTyping ? "default" : "outline"} size="sm" onClick={toggleLiveTyping}>
                <Zap className="w-4 h-4 mr-2" />
                Live Typing
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</main>
    </div>
  )
}

export default Layout
