"use client";

import { useEffect, useState } from "react";

export default function TaskManagement() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("analysis_history");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] flex">
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-[#66fcf1] mb-8">
          Task History
        </h1>

        {history.length === 0 && (
          <p className="text-lg text-[#c5c6c7] opacity-70">
            No past analyses found. Create and analyze tasks to see them here.
          </p>
        )}

        <div className="space-y-6">
          {history.map((entry, index) => (
            <HistoryCard key={index} entry={entry} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryCard({ entry, index }: { entry: any; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#1f2833] border border-[#45a29e] rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#66fcf1]">
            Analysis #{index + 1}
          </h2>
          <p className="text-sm opacity-70">{entry.readable}</p>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-[#66fcf1] hover:text-[#45a29e] transition-colors"
        >
          {open ? "Hide Details" : "View Details"}
        </button>
      </div>

      {/* Collapsible Content */}
      {open && (
        <div className="mt-6 space-y-4">

          {/* Task List */}
          <div>
            <h3 className="text-lg font-semibold text-[#66fcf1] mb-2">
              Tasks
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {entry.tasks.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-[#66fcf1] mb-2">
              Analysis
            </h3>

            {Object.entries(entry.analysis.queries).map(
              ([taskName, details]: any) => (
                <div
                  key={taskName}
                  className="bg-[#0b0c10] p-4 rounded-lg border border-[#45a29e] mb-4"
                >
                  <h4 className="text-[#66fcf1] font-bold mb-2">
                    {taskName}
                  </h4>

                  <p>
                    <span className="font-semibold">Estimated Hours:</span>{" "}
                    {details.estimated_duration_hours}
                  </p>

                  <p>
                    <span className="font-semibold">Confidence:</span>{" "}
                    {details.confidence_score}
                  </p>

                  <div className="mt-2">
                    <span className="font-semibold">Requirements:</span>
                    <ul className="list-disc list-inside ml-4">
                      {details.requirements.map((req: string, i: number) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
