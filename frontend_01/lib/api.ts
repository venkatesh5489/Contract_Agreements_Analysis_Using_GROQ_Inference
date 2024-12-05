import axios from "axios"

const API_BASE_URL = "http://localhost:5000"

export async function uploadDocument(file: File, documentType: 'contract' | 'expected') {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await axios.post(`${API_BASE_URL}/upload/${documentType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error uploading ${documentType} terms:`, error)
    throw new Error(`Failed to upload ${documentType} terms.`)
  }
}

export async function fetchFeedbackReport() {
  try {
    const response = await axios.get(`${API_BASE_URL}/generate_report`)
    return response.data.report
  } catch (error) {
    console.error("Error generating report:", error)
    throw new Error("Failed to fetch report.")
  }
}

export async function fetchPreviousComparisons() {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/previous_comparisons`)
    return response.data.comparisons
  } catch (error) {
    console.error("Error fetching previous comparisons:", error)
    throw new Error("Failed to fetch previous comparisons.")
  }
}

export async function recompareDocuments(comparisonId: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/dashboard/recompare`, { comparison_id: comparisonId })
    return response.data
  } catch (error) {
    console.error("Error re-comparing documents:", error)
    throw new Error("Failed to re-compare documents.")
  }
}

export async function fetchDashboardOverview() {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/overview`)
    return response.data.overview
  } catch (error) {
    console.error("Error fetching dashboard overview:", error)
    throw new Error("Failed to fetch dashboard overview.")
  }
}

export async function fetchDocumentList() {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/documents`)
    return response.data.documents
  } catch (error) {
    console.error("Error fetching document list:", error)
    throw new Error("Failed to fetch document list.")
  }
}

export async function fetchComparisonStatus() {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/comparison_status`)
    return response.data.comparison_status
  } catch (error) {
    console.error("Error fetching comparison status:", error)
    throw new Error("Failed to fetch comparison status.")
  }
}

