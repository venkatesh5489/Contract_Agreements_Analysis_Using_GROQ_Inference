"use client"

import { useState } from "react"
import { Upload, File, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { uploadDocument } from "@/lib/api"

interface FileUploadProps {
  onAnalysisComplete: (results: any) => void
}

export default function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [expectedTermsFile, setExpectedTermsFile] = useState<File | null>(null)
  const [contractTermsFile, setContractTermsFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExpectedTermsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFileType(selectedFile)) {
      setExpectedTermsFile(selectedFile)
      setError(null)
    } else {
      setError("Please upload a valid PDF or DOCX file for Expected Terms.")
    }
  }

  const handleContractTermsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFileType(selectedFile)) {
      setContractTermsFile(selectedFile)
      setError(null)
    } else {
      setError("Please upload a valid PDF or DOCX file for Contract Terms.")
    }
  }

  const isValidFileType = (file: File) => {
    return file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }

  const handleUpload = async () => {
    if (!expectedTermsFile || !contractTermsFile) return

    setUploading(true)
    setError(null)

    try {
      await uploadDocument(expectedTermsFile, 'expected')
      await uploadDocument(contractTermsFile, 'contract')

      setUploading(false)
      setAnalyzing(true)

      // Here you might want to trigger the analysis
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        setAnalyzing(false)
        onAnalysisComplete({ success: true, message: "Analysis completed successfully" })
      }, 2000)
    } catch (err) {
      setError("Failed to upload documents. Please try again.")
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const isSubmitDisabled = !expectedTermsFile || !contractTermsFile || uploading || analyzing

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Expected Terms</h3>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
        >
          <input
            type="file"
            onChange={handleExpectedTermsFileChange}
            accept=".pdf,.docx"
            className="hidden"
            id="expected-terms-upload"
          />
          <label htmlFor="expected-terms-upload" className="cursor-pointer">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to upload Expected Terms file
            </p>
          </label>
          {expectedTermsFile && (
            <div className="mt-2 flex items-center justify-center text-sm text-gray-600">
              <File className="mr-2 h-4 w-4" />
              {expectedTermsFile.name}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contract Terms</h3>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
        >
          <input
            type="file"
            onChange={handleContractTermsFileChange}
            accept=".pdf,.docx"
            className="hidden"
            id="contract-terms-upload"
          />
          <label htmlFor="contract-terms-upload" className="cursor-pointer">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to upload Contract Terms file
            </p>
          </label>
          {contractTermsFile && (
            <div className="mt-2 flex items-center justify-center text-sm text-gray-600">
              <File className="mr-2 h-4 w-4" />
              {contractTermsFile.name}
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleUpload}
        disabled={isSubmitDisabled}
        className="w-full"
      >
        {uploading ? "Uploading..." : analyzing ? "Analyzing..." : "Upload and Analyze"}
      </Button>

      {(uploading || analyzing) && (
        <Progress value={uploading ? 50 : 75} className="mt-4" />
      )}
    </div>
  )
}

