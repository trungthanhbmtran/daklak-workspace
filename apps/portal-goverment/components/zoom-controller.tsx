"use client"

import React, { useState, useEffect } from "react"
import { ZoomIn, ZoomOut, RotateCcw, Type } from "lucide-react"

export default function ZoomController() {
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  // Load zoom from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedZoom = localStorage.getItem("page-zoom-level")
    if (savedZoom) {
      const parsed = parseInt(savedZoom, 10)
      if (parsed >= 80 && parsed <= 150) {
        setZoomLevel(parsed)
      }
    }
  }, [])

  // Apply zoom style to body
  useEffect(() => {
    if (!mounted) return
    if (typeof document !== "undefined" && document.body) {
      (document.body.style as any).zoom = `${zoomLevel}%`
      localStorage.setItem("page-zoom-level", zoomLevel.toString())
    }
  }, [zoomLevel, mounted])

  // Increase zoom level (Max 150%)
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 150))
  }

  // Decrease zoom level (Min 80%)
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 80))
  }

  // Reset zoom level to 100%
  const handleReset = () => {
    setZoomLevel(100)
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 select-none">
      {/* Zoom Controls Panel */}
      {isOpen && (
        <div className="flex flex-col items-center gap-1.5 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/80 animate-fade-in">
          {/* Zoom In Button */}
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 150}
            className="p-2 rounded-xl bg-slate-50 hover:bg-portal-primary hover:text-white dark:bg-slate-950 dark:hover:bg-red-900/60 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-current text-slate-700 dark:text-slate-300 transition-all group"
            title="Phóng to trang (+10%)"
          >
            <ZoomIn className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>

          {/* Current Zoom Percentage Indicator */}
          <div className="text-[10px] font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-200/20 w-11 text-center font-mono">
            {zoomLevel}%
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-50 hover:bg-portal-primary hover:text-white dark:bg-slate-950 dark:hover:bg-red-900/60 text-slate-700 dark:text-slate-300 transition-all group"
            title="Đặt lại kích thước (100%)"
          >
            <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-12" />
          </button>

          {/* Zoom Out Button */}
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 80}
            className="p-2 rounded-xl bg-slate-50 hover:bg-portal-primary hover:text-white dark:bg-slate-950 dark:hover:bg-red-900/60 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-current text-slate-700 dark:text-slate-300 transition-all group"
            title="Thu nhỏ trang (-10%)"
          >
            <ZoomOut className="w-4 h-4 transition-transform group-hover:scale-90" />
          </button>
        </div>
      )}

      {/* Main Accessibility Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border text-white transition-all transform hover:scale-105 active:scale-95 group relative overflow-hidden ${isOpen
          ? "bg-portal-primary border-portal-primary-hover shadow-portal-primary/20"
          : "bg-slate-900 dark:bg-slate-800 border-slate-750 hover:bg-portal-primary dark:hover:bg-portal-primary"
          }`}
        title="Trợ năng: Cỡ chữ & Kích thước trang"
      >
        {/* Glow background on hover */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <Type className="w-5 h-5 group-hover:scale-110 transition-transform" />

        {/* Small indicator dot showing that custom zoom is applied */}
        {zoomLevel !== 100 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 animate-pulse" />
        )}
      </button>
    </div>
  )
}
