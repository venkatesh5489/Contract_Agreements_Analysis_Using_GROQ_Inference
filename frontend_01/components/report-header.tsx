"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Download } from 'lucide-react'
import { exportReport } from "@/lib/api"

export default function ReportsTable({ data, onViewDetails }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("dateProcessed")
  const [sortDirection, setSortDirection] = useState("desc")

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedData = data
    .filter(report =>
      report.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleExport = async (reportId, format) => {
    try {
      const blob = await exportReport(reportId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `report-${reportId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export report:", error)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by contract name or report ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("reportId")} className="cursor-pointer">
              Report ID {sortColumn === "reportId" && (sortDirection === "asc" ? "▲" : "▼")}
            </TableHead>
            <TableHead onClick={() => handleSort("contractName")} className="cursor-pointer">
              Contract Name {sortColumn === "contractName" && (sortDirection === "asc" ? "▲" : "▼")}
            </TableHead>
            <TableHead onClick={() => handleSort("dateProcessed")} className="cursor-pointer">
              Date Processed {sortColumn === "dateProcessed" && (sortDirection === "asc" ? "▲" : "▼")}
            </TableHead>
            <TableHead onClick={() => handleSort("conformityPercentage")} className="cursor-pointer">
              Conformity % {sortColumn === "conformityPercentage" && (sortDirection === "asc" ? "▲" : "▼")}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedData.map((report) => (
            <TableRow key={report.reportId}>
              <TableCell>{report.reportId}</TableCell>
              <TableCell>{report.contractName}</TableCell>
              <TableCell>{new Date(report.dateProcessed).toLocaleString()}</TableCell>
              <TableCell>{report.conformityPercentage.toFixed(2)}%</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onViewDetails(report.reportId)}>
                  View Details
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Choose format</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport(report.reportId, "json")}>
                      JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(report.reportId, "pdf")}>
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(report.reportId, "xlsx")}>
                      Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

