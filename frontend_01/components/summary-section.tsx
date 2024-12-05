import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export default function SummarySection({ summary }) {
  const data = [
    { name: "Matches", value: summary.matches },
    { name: "Mismatches", value: summary.mismatches },
  ]

  const COLORS = ["#4CAF50", "#F44336"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div>
          <p>Matches: {summary.matches}</p>
          <p>Mismatches: {summary.mismatches}</p>
          <p>Conformity Percentage: {summary.conformityPercentage}%</p>
        </div>
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

