"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import ReportHeader from "./report-header"
import ComparisonTable from "./comparison-table"
import SummarySection from "./summary-section"
import Recommendations from "./recommendations"
import { fetchFeedbackReport } from "@/lib/api"

export default function AnalysisResults() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    generateReport()
  }, [])

  const generateReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchFeedbackReport()
      setReport(data)
    } catch (err) {
      setError("Failed to generate report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={generateReport} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return null
  }

  return (
    <div className="space-y-8">
      <ReportHeader report={report} />
      <ComparisonTable data={report.comparisonData} />
      <SummarySection summary={report.summary} />
      <Recommendations recommendations={report.recommendations} />
    </div>
  )
}

