'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FileUpload from '@/components/file-upload'
import AnalysisDisplay from '@/components/AnalysisDisplay';
import ContractHistory from '@/components/contract-history'

interface AnalysisReport {
  report: {
    'Contract Name': string;
    'Expected Terms Name': string;
    'Date Processed': string;
    'Comparison Table': Array<{
      'Clause Name': string;
      'Expected Terms': string;
      'Uploaded Contract': string;
      'Status': string;
      'Remarks': string;
    }>;
    'Summary': {
      'Exact Matches': number;
      'Mismatches': number;
      'Conformity Percentage': number;
    };
    'Recommendations': Array<{
      'Clause Name': string;
      'Recommendation': string;
    }>;
  };
}

export default function ContractReviewDashboard() {
  const [activeTab, setActiveTab] = useState('upload')
  const [analysisResults, setAnalysisResults] = useState<AnalysisReport | null>(null)

  const handleAnalysisComplete = (results: AnalysisReport) => {
    console.log('Analysis results received:', results)
    console.log('Raw results:', results);
    const report = typeof results.report === 'string' ? JSON.parse(results.report) : results.report;
    console.log('Parsed report:', report);
    setAnalysisResults(report);
    setActiveTab('results');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Insurance Contract Review System
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full border-b border-gray-200 mb-8">
          <TabsTrigger
            value="upload"
            className="px-8 py-2 text-gray-600 hover:text-gray-900"
          >
            Upload Contracts
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="px-8 py-2 text-gray-600 hover:text-gray-900"
          >
            Analysis Results
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="px-8 py-2 text-gray-600 hover:text-gray-900"
          >
            Contract History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <FileUpload onAnalysisComplete={handleAnalysisComplete} />
        </TabsContent>

        <TabsContent value="results">
          {analysisResults && typeof analysisResults === 'object' && <AnalysisDisplay report={analysisResults} />}
          {!analysisResults && (
            <div className="text-center text-gray-600">
              Analysis results will appear here
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <ContractHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
