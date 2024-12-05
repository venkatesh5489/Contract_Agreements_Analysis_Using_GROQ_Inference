import React from 'react';

interface ClauseComparison {
  'Clause Name': string;
  'Expected Terms': string;
  'Uploaded Contract': string;
  'Status': string;
  'Remarks': string;
}

interface ReportSummary {
  'Exact Matches': number;
  'Mismatches': number;
  'Conformity Percentage': number;
}

interface Report {
  'Contract Name': string;
  'Expected Terms Name': string;
  'Date Processed': string;
  'Comparison Table': ClauseComparison[];
  'Summary': ReportSummary;
  'Recommendations': Array<{
    'Clause Name': string;
    'Recommendation': string;
  }>;
}

interface AnalysisDisplayProps {
  report: Report;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ report }) => {
  console.log('Received report:', report);
  if (!report || !report.Summary) {
    return (
      <div className="text-center text-gray-600">
        No valid report data available.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Report Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Contract Name</p>
            <p className="font-medium">{report['Contract Name']}</p>
          </div>
          <div>
            <p className="text-gray-600">Expected Terms Name</p>
            <p className="font-medium">{report['Expected Terms Name']}</p>
          </div>
          <div>
            <p className="text-gray-600">Date Processed</p>
            <p className="font-medium">{report['Date Processed']}</p>
          </div>
        </div>
      </div>

      <div className="text-center bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Overall Match Score</h2>
        <div className={`text-4xl font-bold inline-block px-6 py-3 rounded-lg`}>{report.Summary['Conformity Percentage'].toFixed(2)}%</div>
        <div className="grid grid-cols-2 gap-4 mt-4 max-w-md mx-auto">
          <div className="text-green-600">
            <p className="font-medium">Matches</p>
            <p className="text-2xl font-bold">{report.Summary['Exact Matches']}</p>
          </div>
          <div className="text-red-600">
            <p className="font-medium">Mismatches</p>
            <p className="text-2xl font-bold">{report.Summary.Mismatches}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Clause Comparison</h2>
        <div className="space-y-4">
          {report['Comparison Table'].map((clause, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold capitalize">{clause['Clause Name'].replace(/_/g, ' ')}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium`}>{clause.Status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Expected Terms</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{clause['Expected Terms'] || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Contract Terms</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{clause['Uploaded Contract'] || 'N/A'}</p>
                </div>
              </div>
              {clause.Remarks && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-600">Remarks</p>
                  <p className="text-sm text-gray-600">{clause.Remarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {report.Recommendations && report.Recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
          <div className="space-y-3">
            {report.Recommendations.map((rec, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-4">
                <p className="font-medium text-blue-800 mb-1">{rec['Clause Name']}</p>
                <p className="text-blue-600">{rec.Recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDisplay;
