"use client"

/**
 * Enhanced main layout component with theme support
 */

import type React from "react"
import { motion } from "framer-motion"
import { MessageSquare, BarChart3, History, Info, Github, Zap } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
import { useSentimentStore } from "@/lib/store"

interface LayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { useGraphQL, setUseGraphQL } = useSentimentStore()

  const tabs = [
    { id: "analyze", label: "Analyze", icon: MessageSquare },
    { id: "batch", label: "Batch Analysis", icon: BarChart3 },
    { id: "history", label: "History", icon: History },
    { id: "info", label: "Model Info", icon: Info },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Sentiment AI</h1>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-6">
              {/* API Toggle */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">API:</span>
                <button
                  onClick={() => setUseGraphQL(!useGraphQL)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                    useGraphQL ? "bg-purple-600 dark:bg-purple-500" : "bg-green-600 dark:bg-green-500"
                  }`}
                  aria-label={`Switch to ${useGraphQL ? "REST" : "GraphQL"} API`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useGraphQL ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium ${
                    useGraphQL ? "text-purple-600 dark:text-purple-400" : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {useGraphQL ? "GraphQL" : "REST"}
                </span>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* GitHub Link */}
              <a
                href="https://github.com/electronix-ai/sentiment-backend"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="View source on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Built with ❤️ using Next.js, TypeScript, and the siebert/sentiment-roberta-large-english model
              </p>
            </div>
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              © 2024 Sentiment AI. Production-ready sentiment analysis microservice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
