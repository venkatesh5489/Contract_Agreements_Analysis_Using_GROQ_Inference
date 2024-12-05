"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import ComparisonList from "./comparison-list"
import ComparisonDetails from "./comparison-details"
import { fetchPreviousComparisons, recompareDocuments } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const [comparisons, setComparisons] = useState([])
  const [selectedComparison, setSelectedComparison] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    loadComparisons()
  }, [])

  const loadComparisons = async () => {
    try {
      setIsLoading(true)
      const data = await fetchPreviousComparisons()
      setComparisons(data)
    } catch (err) {
      setError("Failed to load comparisons. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load comparisons. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecompare = async (comparisonId) => {
    try {
      setIsLoading(true)
      await recompareDocuments(comparisonId)
      await loadComparisons() // Refresh the list after recompare
      toast({
        title: "Success",
        description: "Re-comparison successful!",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Re-comparison failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading previous comparisons...</span>
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
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Document Comparison Dashboard</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <ComparisonList
          comparisons={comparisons}
          onRecompare={handleRecompare}
          onSelectComparison={setSelectedComparison}
        />
        {selectedComparison && (
          <ComparisonDetails comparison={selectedComparison} />
        )}
      </div>
    </div>
  )
}

