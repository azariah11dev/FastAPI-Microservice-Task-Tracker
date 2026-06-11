"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    setRole(localStorage.getItem("role"));
  }, []);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-transparent backdrop-blur-md flex items-center justify-between px-8 z-50 border-b border-[#1f2833]">
      <div className="flex items-center gap-3">
        <img src="/logo.jpg" alt="TaskForge logo" className="w-8 h-8" />
        <span className="text-[#c5c6c7] font-bold text-xl hover:text-[#45a29e] transition-colors">
          <Link href="/dashboard">Task Forge</Link>
        </span>
      </div>

      <ul className="flex items-center gap-8 text-[#c5c6c7] font-semibold">
        <li>
          {username ? (
            <span className="hover:text-[#45a29e] transition-colors">
              {username} ({role})
            </span>
          ) : (
            <span className="hover:text-[#45a29e] transition-colors">
              Guest
            </span>
          )}
        </li>

        <li className="text-sm text-[#c5c6c7]">
          <span>{dateString}</span> • <span>{timeString}</span>
        </li>

        <li>
          <Link href="/" className="hover:text-[#45a29e] transition-colors">
            Logout
          </Link>
        </li>
      </ul>
    </nav>
  );
}
