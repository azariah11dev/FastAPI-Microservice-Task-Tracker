"use client";

import { useEffect, useState } from "react";

export default function CompletedTasksPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingBackend, setLoadingBackend] = useState(true);
  const [backendError, setBackendError] = useState(false);

  // Load completed tasks from backend
  useEffect(() => {
    const loadBackendHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/task_retrieval/completed_tasks"
        );

        if (!response.ok) throw new Error("Fetch failed");
        const backendEntries: any[] = await response.json();

        console.log("Backend completed tasks:", backendEntries);

        const merged = new Map<number, any>();
        backendEntries.forEach((entry) => merged.set(entry.timestamp, entry));

        const sorted = Array.from(merged.values()).sort(
          (a, b) => b.timestamp - a.timestamp
        );

        setHistory(sorted);
      } catch (err) {
        console.error("Backend history fetch error:", err);
        setBackendError(true);
      } finally {
        setLoadingBackend(false);
      }
    };

    loadBackendHistory();
  }, []);

  // Delete from backend
  const deleteEntry = async (timestamp: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/task_remover/${timestamp}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Delete failed");

      // Remove from UI
      setHistory((prev) =>
        prev.filter((entry) => entry.timestamp !== timestamp)
      );
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] flex">
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-[#66fcf1] mb-6">
          Completed Tasks
        </h1>

        {loadingBackend && (
          <p className="text-sm opacity-60 mb-6">
            Checking for completed analyses...
          </p>
        )}

        {!loadingBackend && backendError && (
          <p className="text-sm text-yellow-500 opacity-80 mb-6">
            Could not reach backend — showing nothing.
          </p>
        )}

        {history.length === 0 && !loadingBackend && (
          <p className="text-lg opacity-70">
            No completed analyses found.
          </p>
        )}

        <div className="space-y-6">
          {history.map((entry) => (
            <div
              key={entry.timestamp}
              className="border border-[#45a29e] rounded-lg p-5 bg-[#1f2833]"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-[#66fcf1]">
                  {entry.name}
                </h2>

                <button
                  onClick={() => deleteEntry(entry.timestamp)}
                  className="px-3 py-1 text-sm border border-red-400 text-red-400 rounded hover:bg-red-400 hover:text-black transition"
                >
                  Delete
                </button>
              </div>

              <p className="text-sm opacity-70 mb-3">{entry.readable}</p>

              <div className="space-y-2">
                {entry.tasks.map((task: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 border border-green-500 text-green-400 rounded bg-[#0b0c10]"
                  >
                    {task}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm opacity-70">
                Total Hours: {entry.total_estimated_hours}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
