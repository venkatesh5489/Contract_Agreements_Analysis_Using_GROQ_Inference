import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Recommendations({ recommendations }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations.map((recommendation, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{recommendation.clauseName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{recommendation.recommendation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

