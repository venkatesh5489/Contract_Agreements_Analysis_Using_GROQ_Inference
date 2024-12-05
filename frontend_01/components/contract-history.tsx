"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

const mockHistory = [
  { id: 1, name: "Contract A", uploadDate: new Date(2023, 5, 1), status: "Analyzed" },
  { id: 2, name: "Contract B", uploadDate: new Date(2023, 5, 15), status: "Pending" },
  { id: 3, name: "Contract C", uploadDate: new Date(2023, 6, 1), status: "Analyzed" },
]

export default function ContractHistory() {
  const [date, setDate] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredHistory = mockHistory.filter((contract) => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = date ? contract.uploadDate.toDateString() === date.toDateString() : true
    return matchesSearch && matchesDate
  })

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract Name</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredHistory.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell>{contract.name}</TableCell>
              <TableCell>{format(contract.uploadDate, "PP")}</TableCell>
              <TableCell>{contract.status}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Re-analyze
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

