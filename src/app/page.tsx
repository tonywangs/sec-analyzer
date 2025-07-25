'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, MessageSquare, Calendar, Building2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AppSidebar from "@/components/layout/Sidebar";
import AuthGuard from "@/components/AuthGuard";

import StatsOverview from "@/components/dashboard/StatsOverview";
import DocumentGrid from "@/components/dashboard/DocumentGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { authenticatedFetch } from '@/lib/api'

export default function Dashboard() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docsResponse, questionsResponse] = await Promise.all([
        authenticatedFetch('/api/documents'),
        authenticatedFetch('/api/questions')
      ]);
      
      const docsData = await docsResponse.json();
      const questionsData = await questionsResponse.json();
      
      // Ensure we always set arrays, even if API returns errors
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      // Set empty arrays on error
      setDocuments([]);
      setQuestions([]);
    }
    setIsLoading(false);
  };

  return (
    <AuthGuard>
      <AppSidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
          >
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Document Library
              </h1>
              <p className="text-slate-600 text-lg">
                Upload, analyze, and query your SEC filings with AI precision
              </p>
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto">
              <Link href="/upload" className="flex-1 lg:flex-none">
                <Button className="w-full bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500 text-white shadow-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Filing
                </Button>
              </Link>
              {documents.length > 0 && (
                <Link href="/analysis" className="flex-1 lg:flex-none">
                  <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Start Analysis
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          <StatsOverview 
            documents={documents}
            questions={questions}
            isLoading={isLoading}
          />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DocumentGrid 
                documents={documents}
                isLoading={isLoading}
                onRefresh={loadData}
              />
            </div>
            
            <div>
              <RecentActivity 
                questions={questions}
                documents={documents}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
      </AppSidebar>
    </AuthGuard>
  );
} 