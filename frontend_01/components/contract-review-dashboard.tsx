"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileUpload from "./file-upload"
import AnalysisResults from "./analysis-results"
import ContractHistory from "./contract-history"

export default function ContractReviewDashboard() {
  const [activeTab, setActiveTab] = useState("upload")
  const [analysisResults, setAnalysisResults] = useState(null)

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results)
    setActiveTab("results")
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upload">Upload Contracts</TabsTrigger>
        <TabsTrigger value="results">Analysis Results</TabsTrigger>
        <TabsTrigger value="history">Contract History</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <FileUpload onAnalysisComplete={handleAnalysisComplete} />
      </TabsContent>
      <TabsContent value="results">
        <AnalysisResults results={analysisResults} />
      </TabsContent>
      <TabsContent value="history">
        <ContractHistory />
      </TabsContent>
    </Tabs>
  )
}

