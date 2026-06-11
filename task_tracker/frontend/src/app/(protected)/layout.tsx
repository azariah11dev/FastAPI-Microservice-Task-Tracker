// app/(public)/layout.tsx
"use client";
import SideBar from "./components/sideBar";
import TopBar from "./components/topBar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar />
      <main className="flex flex-1 flex-row">
        <TopBar />
        {children}
      </main>
    </div>
  );
}
