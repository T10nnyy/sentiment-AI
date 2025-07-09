"use client"

import type React from "react"
import { motion } from "framer-motion"
import { clsx } from "clsx"

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

const Card: React.FC<CardProps> = ({ children, className, hover = false, padding = "md" }) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } : {}}
      className={clsx(
        "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700",
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export default Card
