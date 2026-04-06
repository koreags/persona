'use client'
import { useEffect } from 'react'

export default function VisitTracker() {
  useEffect(() => {
    fetch('/api/stats', { method: 'POST' })
  }, [])
  return null
}
