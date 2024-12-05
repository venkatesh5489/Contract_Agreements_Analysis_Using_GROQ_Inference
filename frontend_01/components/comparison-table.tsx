import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ComparisonTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Clause Name</TableHead>
          <TableHead>Expected Terms</TableHead>
          <TableHead>Uploaded Contract</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Remarks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.clauseName}</TableCell>
            <TableCell>{truncateText(row.expectedTerms, 50)}</TableCell>
            <TableCell>{truncateText(row.uploadedContract, 50)}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.remarks}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

