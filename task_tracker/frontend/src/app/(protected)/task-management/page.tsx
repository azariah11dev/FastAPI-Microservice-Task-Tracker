"use client";

import { useEffect, useState } from "react";

type TaskStatus = "not_started" | "in_progress" | "completed";

const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  not_started: "bg-[#0b0c10] border-[#45a29e] text-[#c5c6c7]",
  in_progress: "bg-[#1f2833] border-yellow-500 text-yellow-400",
  completed: "bg-[#1f2833] border-green-500 text-green-400",
};

export default function TaskManagement() {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingBackend, setLoadingBackend] = useState(true);
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    const local: any[] = JSON.parse(
      localStorage.getItem("analysis_history") || "[]"
    );

    // Show local entries immediately so the page isn't empty while we fetch.
    setHistory(local);

    const loadBackendHistory = async () => {
      try {
        // TODO: point this at your real GET endpoint once it exists.
        const response = await fetch("http://localhost:8000/task_retrieval/existing_tasks", {
          method: "GET",
        });

        if (!response.ok) throw new Error("Fetch failed");
        const backendEntries: any[] = await response.json();

        // Merge by timestamp; backend entries take priority over local
        // duplicates since they represent whatever was actually saved.
        const merged = new Map<number, any>();
        for (const entry of local) merged.set(entry.timestamp, entry);
        for (const entry of backendEntries) merged.set(entry.timestamp, entry);

        const mergedList = Array.from(merged.values()).sort(
          (a, b) => b.timestamp - a.timestamp
        );

        setHistory(mergedList);
      } catch (err) {
        console.error("Backend history fetch stub error (expected until endpoint exists):", err);
        setBackendError(true);
      } finally {
        setLoadingBackend(false);
      }
    };

    loadBackendHistory();
  }, []);

  // Only writes back to localStorage — backend-sourced entries simply won't
  // exist there until the user hits Save again, which is expected.
  const persistHistory = (updated: any[]) => {
    setHistory(updated);
    localStorage.setItem("analysis_history", JSON.stringify(updated));
  };

  const updateEntry = (timestamp: number, updater: (entry: any) => any) => {
    const updated = history.map((entry) =>
      entry.timestamp === timestamp ? updater(entry) : entry
    );
    persistHistory(updated);
  };

  const discardEntry = (timestamp: number) => {
    const updated = history.filter((entry) => entry.timestamp !== timestamp);
    persistHistory(updated);
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] flex">
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-[#66fcf1] mb-2">
          Task History
        </h1>

        {loadingBackend && (
          <p className="text-sm text-[#c5c6c7] opacity-60 mb-6">
            Checking for saved analyses...
          </p>
        )}
        {!loadingBackend && backendError && (
          <p className="text-sm text-yellow-500 opacity-80 mb-6">
            Showing local analyses only — couldn't reach saved history.
          </p>
        )}

        {history.length === 0 && (
          <p className="text-lg text-[#c5c6c7] opacity-70">
            No past analyses found. Create and analyze tasks to see them here.
          </p>
        )}

        <div className="space-y-6">
          {history.map((entry, index) => (
            <HistoryCard
              key={entry.timestamp}
              entry={entry}
              index={index}
              onUpdate={(updater) => updateEntry(entry.timestamp, updater)}
              onDiscard={() => discardEntry(entry.timestamp)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryCard({
  entry,
  index,
  onUpdate,
  onDiscard,
}: {
  entry: any;
  index: number;
  onUpdate: (updater: (entry: any) => any) => void;
  onDiscard: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(
    entry.name || `Analysis #${index + 1}`
  );
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle"
  );

  const taskEntries = Object.entries(entry.analysis.queries) as [
    string,
    any
  ][];

  // Per-task status, keyed by task name. Defaults to "not_started".
  const statuses: Record<string, TaskStatus> = entry.statuses || {};

  const getStatus = (taskName: string): TaskStatus =>
    statuses[taskName] || "not_started";

  const setStatus = (taskName: string, status: TaskStatus) => {
    onUpdate((prevEntry) => ({
      ...prevEntry,
      statuses: {
        ...(prevEntry.statuses || {}),
        [taskName]: status,
      },
    }));
  };

  const commitName = () => {
    const trimmed = nameDraft.trim() || `Analysis #${index + 1}`;
    onUpdate((prevEntry) => ({ ...prevEntry, name: trimmed }));
    setNameDraft(trimmed);
    setEditingName(false);
  };

  // Total hours, and hours remaining after subtracting completed tasks.
  const totalHours = taskEntries.reduce(
    (sum, [, details]) => sum + (Number(details.estimated_duration_hours) || 0),
    0
  );

  const remainingHours = taskEntries.reduce((sum, [taskName, details]) => {
    const hours = Number(details.estimated_duration_hours) || 0;
    return getStatus(taskName) === "completed" ? sum : sum + hours;
  }, 0);

  const completedCount = taskEntries.filter(
    ([taskName]) => getStatus(taskName) === "completed"
  ).length;

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");

    // Ensure required string fields have fallbacks
    const resolvedName =
      entry.name?.trim().length > 0 ? entry.name : `Analysis #${index + 1}`;

    const resolvedStatuses: Record<string, string> = entry.statuses || {};

    // Strip `raw` and any extra fields — backend only accepts the three fields in TaskQueryInfo
    const cleanedAnalysis = {
      queries: Object.fromEntries(
        Object.entries(entry.analysis.queries).map(([taskName, details]: [string, any]) => [
          taskName,
          {
            estimated_duration_hours: Number(details.estimated_duration_hours) || 0,
            confidence_score: Number(details.confidence_score) || 0,
            requirements: Array.isArray(details.requirements) ? details.requirements : [],
          },
        ])
      ),
    };

    const payload = {
      timestamp: entry.timestamp,
      readable: entry.readable,
      name: resolvedName,
      tasks: entry.tasks,
      analysis: cleanedAnalysis,   // use cleaned version, not entry.analysis
      statuses: resolvedStatuses,
      total_estimated_hours: Number(totalHours.toFixed(2)),
      remaining_estimated_hours: Number(remainingHours.toFixed(2)),
    };

    try {
      const response = await fetch("http://localhost:8000/query_builder/save_tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Save failed");
      setSaveStatus("saved");
    } catch (err) {
      console.error("Save error:", err, payload);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#1f2833] border border-[#45a29e] rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitName();
                if (e.key === "Escape") {
                  setNameDraft(entry.name || `Analysis #${index + 1}`);
                  setEditingName(false);
                }
              }}
              className="text-xl font-bold text-[#66fcf1] bg-[#0b0c10] border border-[#45a29e] rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-[#45a29e]"
            />
          ) : (
            <h2
              className="text-xl font-bold text-[#66fcf1] cursor-pointer hover:text-[#45a29e] transition-colors w-fit"
              onClick={() => setEditingName(true)}
              title="Click to rename"
            >
              {entry.name || `Analysis #${index + 1}`}
            </h2>
          )}
          <p className="text-sm opacity-70 mt-1">{entry.readable}</p>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-[#66fcf1] hover:text-[#45a29e] transition-colors whitespace-nowrap"
        >
          {open ? "Hide Details" : "View Details"}
        </button>
      </div>

      {/* Collapsible Content */}
      {open && (
        <div className="mt-6 space-y-4">
          {/* Checklist */}
          <div>
            <h3 className="text-lg font-semibold text-[#66fcf1] mb-2">
              Tasks ({completedCount}/{taskEntries.length} completed)
            </h3>

            <div className="space-y-3">
              {taskEntries.map(([taskName, details]) => {
                const status = getStatus(taskName);
                return (
                  <div
                    key={taskName}
                    className={`p-4 rounded-lg border transition-colors ${STATUS_STYLES[status]}`}
                  >
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <h4
                        className={`font-bold ${status === "completed" ? "line-through opacity-70" : ""
                          }`}
                      >
                        {taskName}
                      </h4>

                      <select
                        value={status}
                        onChange={(e) =>
                          setStatus(taskName, e.target.value as TaskStatus)
                        }
                        className="bg-[#0b0c10] border border-[#45a29e] rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#45a29e]"
                      >
                        <option value="not_started">
                          {STATUS_LABELS.not_started}
                        </option>
                        <option value="in_progress">
                          {STATUS_LABELS.in_progress}
                        </option>
                        <option value="completed">
                          {STATUS_LABELS.completed}
                        </option>
                      </select>
                    </div>

                    <p className="mt-2">
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
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-[#0b0c10] border border-[#45a29e] rounded-lg p-4 flex justify-between items-center flex-wrap gap-2">
            <span className="font-semibold text-[#66fcf1]">
              Total Estimated Time: {totalHours.toFixed(2)} hrs
            </span>
            <span className="font-semibold text-[#66fcf1]">
              Remaining: {remainingHours.toFixed(2)} hrs
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onDiscard}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Discard
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            {saveStatus === "saved" && (
              <span className="text-green-400 self-center text-sm">
                Saved!
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-red-400 self-center text-sm">
                Save endpoint not implemented yet
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}