"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(
            "http://localhost:8000/task_retrieval/analytics"
        );

        if (!response.ok) throw new Error("Fetch failed");
        const backendEntries: any[] = await response.json();

        setHistory(backendEntries);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // -----------------------------
  // ANALYTICS CALCULATIONS
  // -----------------------------

  const totalAnalyses = history.length;

  const totalTasks = history.reduce(
    (sum, entry) => sum + (entry.tasks?.length || 0),
    0
  );

  const totalHours = history.reduce(
    (sum, entry) => sum + (entry.total_estimated_hours || 0),
    0
  );

  const completedAnalyses = history.filter(
    (entry) => entry.remaining_estimated_hours === 0
  ).length;

  const completionRate =
    totalAnalyses > 0
      ? ((completedAnalyses / totalAnalyses) * 100).toFixed(1)
      : "0";

  const avgTasksPerAnalysis =
    totalAnalyses > 0 ? (totalTasks / totalAnalyses).toFixed(1) : "0";

  const avgHoursPerAnalysis =
    totalAnalyses > 0 ? (totalHours / totalAnalyses).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] p-10">
      <h1 className="text-3xl font-bold text-[#66fcf1] mb-8">
        Analytics Dashboard
      </h1>

      {loading && (
        <p className="text-sm opacity-60">Loading analytics...</p>
      )}

      {!loading && error && (
        <p className="text-sm text-yellow-500 opacity-80">
          Could not load analytics — backend unreachable.
        </p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Total Analyses */}
          <div className="p-6 bg-[#1f2833] border border-[#45a29e] rounded-lg">
            <h2 className="text-xl font-semibold text-[#66fcf1] mb-2">
              Total Analyses
            </h2>
            <p className="text-4xl font-bold">{totalAnalyses}</p>
          </div>

          {/* Completed Analyses */}
          <div className="p-6 bg-[#1f2833] border border-green-500 rounded-lg">
            <h2 className="text-xl font-semibold text-green-400 mb-2">
              Completed Analyses
            </h2>
            <p className="text-4xl font-bold text-green-400">
              {completedAnalyses}
            </p>
          </div>

          {/* Completion Rate */}
          <div className="p-6 bg-[#1f2833] border border-blue-500 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-400 mb-2">
              Completion Rate
            </h2>
            <p className="text-4xl font-bold text-blue-400">
              {completionRate}%
            </p>
          </div>

          {/* Total Tasks */}
          <div className="p-6 bg-[#1f2833] border border-purple-500 rounded-lg">
            <h2 className="text-xl font-semibold text-purple-400 mb-2">
              Total Tasks Analyzed
            </h2>
            <p className="text-4xl font-bold text-purple-400">
              {totalTasks}
            </p>
          </div>

          {/* Avg Tasks */}
          <div className="p-6 bg-[#1f2833] border border-yellow-500 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">
              Avg Tasks per Analysis
            </h2>
            <p className="text-4xl font-bold text-yellow-400">
              {avgTasksPerAnalysis}
            </p>
          </div>

          {/* Avg Hours */}
          <div className="p-6 bg-[#1f2833] border border-pink-500 rounded-lg">
            <h2 className="text-xl font-semibold text-pink-400 mb-2">
              Avg Estimated Hours per Analysis
            </h2>
            <p className="text-4xl font-bold text-pink-400">
              {avgHoursPerAnalysis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
