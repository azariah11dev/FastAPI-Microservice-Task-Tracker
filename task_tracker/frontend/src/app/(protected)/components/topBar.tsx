"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    setRole(localStorage.getItem("role"));

    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = now?.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeString = now?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const logoutBtn = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("access_token");
    localStorage.removeItem("analysis_history");
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-transparent backdrop-blur-md flex items-center justify-between px-8 z-50 border-b border-[#1f2833]">
      <div className="flex items-center gap-3">
        <Image src="/logo.jpg" alt="TaskForge logo" width={32} height={32} />
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
          {now && (
            <>
              <span>{dateString}</span> • <span>{timeString}</span>
            </>
          )}
        </li>

        <li>
          <button
            className="text-[#c5c6c7] hover:text-[#45a29e] transition-colors"
            onClick={logoutBtn}
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
