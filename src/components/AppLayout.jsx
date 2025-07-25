'use client'

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Upload, BarChart3, MessageSquare } from "lucide-react";

const navigationItems = [
  {
    title: "Document Library",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Upload Filing",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "Analysis",
    href: "/analysis",
    icon: MessageSquare,
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
      <aside className="w-64 border-r border-slate-200/60 bg-white/70 backdrop-blur-xl hidden md:flex flex-col">
        <header className="border-b border-slate-200/60 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-800 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">SEC Analyzer</h2>
              <p className="text-xs text-slate-500 font-medium">Next.js + Supabase</p>
            </div>
          </div>
        </header>
        
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.title}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-slate-100 hover:text-slate-900 ${
                    pathname === item.href 
                      ? 'bg-gradient-to-r from-slate-800 to-slate-600 text-white shadow-lg' 
                      : 'text-slate-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 md:hidden">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger could be added here */}
            <h1 className="text-xl font-bold text-slate-900">SEC Analyzer</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}