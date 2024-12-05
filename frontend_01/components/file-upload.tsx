'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api-config'

interface FileUploadProps {
  onAnalysisComplete: (results: any) => void
}

export default function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [expectedTermsFile, setExpectedTermsFile] = useState<File | null>(null)
  const [contractTermsFile, setContractTermsFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState({
    expected: false,
    contract: false
  })

  const handleExpectedTermsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setExpectedTermsFile(file)
      setError(null)
      setUploadStatus(prev => ({ ...prev, expected: false }))
    }
  }

  const handleContractTermsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setContractTermsFile(file)
      setError(null)
      setUploadStatus(prev => ({ ...prev, contract: false }))
    }
  }

  const uploadFile = async (file: File, endpoint: string): Promise<boolean> => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin'
      })
      return response.ok
    } catch (error) {
      console.error('Error uploading file:', error)
      return false
    }
  }

  const handleAnalyze = async () => {
    if (!expectedTermsFile || !contractTermsFile) return

    setIsLoading(true)
    setError(null)
    setUploadStatus({ expected: false, contract: false })

    try {
      // Upload expected terms
      const expectedSuccess = await uploadFile(expectedTermsFile, API_ENDPOINTS.uploadExpected)
      if (!expectedSuccess) {
        throw new Error('Failed to upload expected terms')
      }
      setUploadStatus(prev => ({ ...prev, expected: true }))
      console.log('Expected terms uploaded successfully')

      // Upload contract terms
      const contractSuccess = await uploadFile(contractTermsFile, API_ENDPOINTS.uploadContract)
      if (!contractSuccess) {
        throw new Error('Failed to upload contract terms')
      }
      setUploadStatus(prev => ({ ...prev, contract: true }))
      console.log('Contract terms uploaded successfully')

      // Generate report only if both uploads were successful
      if (expectedSuccess && contractSuccess) {
        console.log('Generating report...')
        const reportResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.generateReport}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'same-origin'
        })

        if (!reportResponse.ok) {
          throw new Error('Failed to generate report')
        }

        const reportData = await reportResponse.json()
        console.log('Report data received:', reportData)
        
        if (reportData.error) {
          throw new Error(reportData.error)
        }

        onAnalysisComplete(reportData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error during upload/analysis:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Expected Terms</h2>
        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          uploadStatus.expected ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <input
            type="file"
            id="expectedTerms"
            className="hidden"
            onChange={handleExpectedTermsUpload}
            accept=".pdf,.doc,.docx"
          />
          <label htmlFor="expectedTerms" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Upload className={`h-8 w-8 mb-2 ${uploadStatus.expected ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={uploadStatus.expected ? 'text-green-600' : 'text-gray-600'}>
                {expectedTermsFile 
                  ? expectedTermsFile.name 
                  : "Click to upload Expected Terms file"}
              </span>
              {uploadStatus.expected && (
                <span className="text-green-600 text-sm mt-2">Upload successful</span>
              )}
            </div>
          </label>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Contract Terms</h2>
        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          uploadStatus.contract ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <input
            type="file"
            id="contractTerms"
            className="hidden"
            onChange={handleContractTermsUpload}
            accept=".pdf,.doc,.docx"
          />
          <label htmlFor="contractTerms" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Upload className={`h-8 w-8 mb-2 ${uploadStatus.contract ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={uploadStatus.contract ? 'text-green-600' : 'text-gray-600'}>
                {contractTermsFile 
                  ? contractTermsFile.name 
                  : "Click to upload Contract Terms file"}
              </span>
              {uploadStatus.contract && (
                <span className="text-green-600 text-sm mt-2">Upload successful</span>
              )}
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center">
          {error}
        </div>
      )}

      <Button
        onClick={handleAnalyze}
        disabled={!expectedTermsFile || !contractTermsFile || isLoading}
        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Upload and Analyze'}
      </Button>
    </div>
  )
}
