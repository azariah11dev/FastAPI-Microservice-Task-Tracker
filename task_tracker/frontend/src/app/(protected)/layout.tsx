"use client";
import SideBar from "./components/sideBar";
import TopBar from "./components/topBar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-[#c5c6c7] flex flex-col">
      <TopBar />
      <SideBar />

      <main className="flex-1 pt-16 pl-48 p-4">
        {children}
      </main>
    </div>
  );
}