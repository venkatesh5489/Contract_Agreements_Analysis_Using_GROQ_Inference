import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportHeader({ report }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Report</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Contract Name</p>
          <p className="text-lg">{report.contractName}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Expected Terms</p>
          <p className="text-lg">{report.expectedTermsName}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Conformity Percentage</p>
          <p className="text-lg font-bold">{report.conformityPercentage}%</p>
        </div>
        <div>
          <p className="text-sm font-medium">Date Processed</p>
          <p className="text-lg">{new Date(report.dateProcessed).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

