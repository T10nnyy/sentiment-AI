"use client"

import type React from "react"
import { clsx } from "clsx"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea: React.FC<TextareaProps> = ({ label, error, helperText, className, ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <textarea
        className={clsx(
          "w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none",
          error
            ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
          "text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400",
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  )
}

export default Textarea
