"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] flex px-10">

      <div className="flex-1 p-10">

        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#66fcf1]">
            Welcome{username ? `, ${username}` : ""}.
          </h1>
          <p className="mt-3 text-lg text-[#c5c6c7]">
            This is your TaskForge dashboard — your personal productivity hub.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

          <Link
            href="/create-task"
            className="bg-[#1f2833] border border-[#45a29e] rounded-xl p-6 hover:bg-[#162025] transition-colors shadow-lg"
          >
            <h2 className="text-xl font-bold text-[#66fcf1] mb-2">Create Tasks</h2>
            <p className="text-sm text-[#c5c6c7]">
              Add tasks and prepare them for AI-powered analysis.
            </p>
          </Link>

          <Link
            href="/task-management"
            className="bg-[#1f2833] border border-[#45a29e] rounded-xl p-6 hover:bg-[#162025] transition-colors shadow-lg"
          >
            <h2 className="text-xl font-bold text-[#66fcf1] mb-2">Task Management</h2>
            <p className="text-sm text-[#c5c6c7]">
              View, sort, and prioritize your tasks once analyzed.
            </p>
          </Link>

          <Link
            href="/analytics"
            className="bg-[#1f2833] border border-[#45a29e] rounded-xl p-6 hover:bg-[#162025] transition-colors shadow-lg">
            <h2 className="text-xl font-bold text-[#66fcf1] mb-2">Analytics</h2>
            <p className="text-sm text-[#c5c6c7]">
              Visual insights into your productivity patterns.
            </p>
          </Link>

        </div>

        {/* Info Section */}
        <div className="bg-[#1f2833] border border-[#45a29e] rounded-xl p-8 shadow-xl max-w-4xl">
          <h2 className="text-2xl font-bold text-[#66fcf1] mb-4">What's Next?</h2>
          <p className="text-[#c5c6c7] mb-6">
            TaskForge is evolving. Soon you'll be able to:
          </p>

          <ul className="list-disc list-inside space-y-2 text-[#c5c6c7]">
            <li>Generate smart schedules based on your availability</li>
            <li>Visualize your workload with charts and timelines</li>
            <li>Track productivity trends over time</li>
            <li>Integrate with calendars and external tools</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
