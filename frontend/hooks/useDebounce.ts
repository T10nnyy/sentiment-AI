"use client"

/**
 * Debounce hook for live typing inference
 */

import { useState, useEffect } from "react"
import { getDebounceDelay } from "@/lib/utils"

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const actualDelay = delay || getDebounceDelay()

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, actualDelay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, actualDelay])

  return debouncedValue
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay?: number): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const actualDelay = delay || getDebounceDelay()

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      callback(...args)
    }, actualDelay)

    setDebounceTimer(timer)
  }) as T

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return debouncedCallback
}
