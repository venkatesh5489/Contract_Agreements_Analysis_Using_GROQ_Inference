import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SummaryCards({ data }) {
  const totalReports = data.length
  const averageConformity = data.reduce((sum, report) => sum + report.conformityPercentage, 0) / totalReports
  const totalMismatches = data.reduce((sum, report) => sum + report.mismatches, 0)
  const totalMatches = data.reduce((sum, report) => sum + report.matches, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReports}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Conformity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageConformity.toFixed(2)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Mismatches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMismatches}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMatches}</div>
        </CardContent>
      </Card>
    </div>
  )
}

