import React from 'react';

interface AnalysisResultsProps {
  reportData: {
    matched_clauses?: Array<{
      clause: string;
      index: number;
    }>;
  };
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ reportData }) => {
  // Add null check for reportData and matched_clauses
  if (!reportData || !reportData.matched_clauses) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">No Analysis Results Available</h2>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Clause Comparison</h2>
      <div className="space-y-4">
        {reportData.matched_clauses.map((clause, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold capitalize">{clause.clause.replace(/_/g, ' ')}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisResults;
