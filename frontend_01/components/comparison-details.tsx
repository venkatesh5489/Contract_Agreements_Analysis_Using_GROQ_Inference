import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ComparisonDetails({ comparison }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Contract Document:</h3>
            <p>{comparison.contractDocument}</p>
          </div>
          <div>
            <h3 className="font-semibold">Expected Terms Document:</h3>
            <p>{comparison.expectedTermsDocument}</p>
          </div>
          <div>
            <h3 className="font-semibold">Comparison Date:</h3>
            <p>{new Date(comparison.date).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-semibold">Results:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.term}</TableCell>
                    <TableCell>{result.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

