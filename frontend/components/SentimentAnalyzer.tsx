"use client"

/**
 * Enhanced main sentiment analysis component with GraphQL and live typing support
 */

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Sparkles, Zap, RotateCcw } from "lucide-react"

import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Textarea from "@/components/ui/Textarea"
import ResultDisplay from "@/components/ResultDisplay"
import LiveTypingInference from "@/components/LiveTypingInference"
import { useSentimentPrediction } from "@/hooks/useSentiment"
import { useSentimentStore } from "@/lib/store"
import type { SentimentResult } from "@/types/sentiment"

// Form validation schema
const analysisSchema = z.object({
  text: z.string().min(1, "Please enter some text to analyze").max(2000, "Text must be less than 2000 characters"),
})

type AnalysisFormData = z.infer<typeof analysisSchema>

const SentimentAnalyzer: React.FC = () => {
  const [result, setResult] = useState<SentimentResult | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)

  const { currentText, setCurrentText, currentResult, setCurrentResult, useGraphQL, reset } = useSentimentStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    watch,
    setValue,
  } = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      text: currentText,
    },
  })

  const { predict, isLoading } = useSentimentPrediction()
  const textValue = watch("text", "")

  // Update store when text changes
  useEffect(() => {
    setCurrentText(textValue)
  }, [textValue, setCurrentText])

  // Update form when store changes
  useEffect(() => {
    if (currentText !== textValue) {
      setValue("text", currentText)
    }
  }, [currentText, textValue, setValue])

  const onSubmit = async (data: AnalysisFormData) => {
    const startTime = Date.now()

    try {
      const result = await predict(data.text)
      setResult(result)
      setCurrentResult(result)
      setResponseTime(Date.now() - startTime)
    } catch (error) {
      console.error("Analysis failed:", error)
      setResponseTime(null)
    }
  }

  const handleReset = () => {
    resetForm({ text: "" })
    setResult(null)
    setResponseTime(null)
    reset()
  }

  const handleExampleClick = (exampleText: string) => {
    setValue("text", exampleText)
    setCurrentText(exampleText)
  }

  const examples = [
    {
      text: "I absolutely love this product! It exceeded all my expectations and the customer service was outstanding.",
      type: "Positive" as const,
    },
    {
      text: "This service was terrible and completely disappointing. I would not recommend it to anyone.",
      type: "Negative" as const,
    },
    {
      text: "The new update brings amazing features that make the app so much more enjoyable to use!",
      type: "Positive" as const,
    },
    {
      text: "I'm frustrated with the poor quality and slow delivery. This was a waste of money.",
      type: "Negative" as const,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-4"
        >
          <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Sentiment Analysis</h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg"
        >
          Analyze the emotional tone of any text using our advanced AI model. Get instant insights into whether your
          content conveys positive or negative sentiment.
        </motion.p>
      </div>

      {/* Analysis Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Textarea
                {...register("text")}
                label="Text to Analyze"
                placeholder="Enter your text here... (e.g., 'I love this product! It exceeded my expectations.')"
                rows={6}
                error={errors.text?.message}
                helperText={`${textValue.length}/2000 characters • Using ${useGraphQL ? "GraphQL" : "REST"} API`}
                className="text-base"
              />
            </div>

            {/* Live Typing Inference */}
            <LiveTypingInference text={textValue} />

            <div className="flex justify-center space-x-4">
              <Button
                type="submit"
                loading={isLoading}
                icon={<MessageSquare className="w-4 h-4" />}
                size="lg"
                className="min-w-[200px]"
                disabled={!textValue.trim() || textValue.length < 1}
              >
                {isLoading ? "Analyzing..." : "Analyze Sentiment"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                icon={<RotateCcw className="w-4 h-4 bg-transparent" />}
                size="lg"
                disabled={!textValue.trim() && !result}
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <ResultDisplay result={result} responseTime={responseTime || undefined} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Examples */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Try These Examples</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examples.map((example, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExampleClick(example.text)}
                className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      example.type === "Positive"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                    }`}
                  >
                    {example.type}
                  </span>
                  <Zap className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{example.text}</p>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default SentimentAnalyzer
