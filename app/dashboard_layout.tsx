"use client"

import React from "react";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import SidebarContent from "@/components/dashboard/Sidebar/RootSidebar";
import SidebarToggleButton from "@/components/dashboard/Sidebar/ToggleButton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen w-full bg-white dark:bg-[#111110] text-[#1A1A18] dark:text-[#F0EFE9]"
    >
      <SidebarContent />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="h-14 shrink-0 flex items-center px-5 gap-3 border-b border-[#E8E8E4] dark:border-[#252522] bg-white/80 dark:bg-[#111110]/80 backdrop-blur-md z-20"
        >
          <SidebarToggleButton />

          <div className="flex-1" />

          <ThemeToggle />
        </header>

        {/* Main content */}
        <main className="
          flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}