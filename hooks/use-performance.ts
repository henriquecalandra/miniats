"use client"

import { useEffect, useState } from "react"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    const startTime = performance.now()

    // Medir tempo de carregamento
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime

      // Medir uso de memória (se disponível)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(performance.now() - startTime),
        memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024 / 1024) : undefined,
      })
    }

    // Aguardar o próximo frame para medir o tempo de renderização
    requestAnimationFrame(measureLoadTime)
  }, [])

  return metrics
}
