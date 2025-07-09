"use client"

/**
 * Main application page
 */

import { useState } from "react"
import Head from "next/head"
import Layout from "@/components/Layout"
import SentimentAnalyzer from "@/components/SentimentAnalyzer"
import BatchAnalyzer from "@/components/BatchAnalyzer"
import AnalysisHistory from "@/components/AnalysisHistory"
import ModelInfo from "@/components/ModelInfo"

export default function Home() {
  const [activeTab, setActiveTab] = useState("analyze")

  const renderContent = () => {
    switch (activeTab) {
      case "analyze":
        return <SentimentAnalyzer />
      case "batch":
        return <BatchAnalyzer />
      case "history":
        return <AnalysisHistory />
      case "info":
        return <ModelInfo />
      default:
        return <SentimentAnalyzer />
    }
  }

  return (
    <>
      <Head>
        <title>Sentiment AI - Advanced Text Sentiment Analysis</title>
        <meta
          name="description"
          content="Analyze text sentiment with our advanced AI model. Get instant insights into positive and negative emotions in your content."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </>
  )
}
