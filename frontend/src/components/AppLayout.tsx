"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Breadcrumbs } from "./Breadcrumbs";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div
        className={`
          transition-all duration-300
          ${sidebarOpen ? "lg:pl-64" : "lg:pl-20"}
        `}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b-2 border-[#d4c5b9] px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-[#0f3d3e]/5 transition-colors"
            >
              <svg
                className="w-6 h-6 text-[#0f3d3e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Breadcrumbs */}
            <Breadcrumbs />


          </div>
        </header>

        {/* Page Content */}
        <main className="px-6 py-8 md:px-12 md:py-12">{children}</main>
      </div>
    </div>
  );
}
