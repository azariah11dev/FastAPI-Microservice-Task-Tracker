"use client";
import Link from "next/link";

export default function SideBar() {
  return (
    <div className="fixed top-16 left-0 h-[calc(100%-4rem)] w-48 flex flex-col gap-9 font-semibold pt-4 bg-black border-r border-transparent z-40">
      <ul>
        <li className="p-4 hover:text-[#45a29e] cursor-pointer">
          <Link href="/create-task">
            Create Task
          </Link>
        </li>
        <li className="p-4 hover:text-[#45a29e] cursor-pointer">
          <Link href="/task-management">
            Task Management
          </Link>
        </li>
        <li className="p-4 hover:text-[#45a29e] cursor-pointer">
          <Link href="/task-history">
            Task History
          </Link>
        </li>
        <li className="p-4 hover:text-[#45a29e] cursor-pointer">
          <Link href="/remove-tasks">
            Remove Tasks
          </Link>
        </li>
      </ul>
    </div>
  );
}