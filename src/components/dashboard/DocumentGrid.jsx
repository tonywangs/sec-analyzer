import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Building2, ExternalLink, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Safe date formatting function
const formatDate = (dateString) => {
  try {
    if (!dateString) return "Unknown date";
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

const documentTypeColors = {
  "10-K": "bg-blue-100 text-blue-800 border-blue-200",
  "10-Q": "bg-green-100 text-green-800 border-green-200",
  "8-K": "bg-purple-100 text-purple-800 border-purple-200",
  "Other": "bg-gray-100 text-gray-800 border-gray-200"
};

const statusColors = {
  "ready": "bg-green-100 text-green-800",
  "processing": "bg-yellow-100 text-yellow-800",
  "error": "bg-red-100 text-red-800"
};

export default function DocumentGrid({ documents, isLoading, onRefresh }) {
  // Safety check to ensure we have an array
  const safeDocuments = Array.isArray(documents) ? documents : [];

  if (isLoading) {
    return (
      <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-600" />
            Your Documents
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh} className="border-slate-300">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {safeDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No documents yet</h3>
            <p className="text-slate-500 mb-6">Upload your first SEC filing to get started</p>
            <Link href="/upload">
              <Button className="bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500">
                Upload Your First Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {safeDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-white/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{doc.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`${documentTypeColors[doc.document_type]} border font-medium`}>
                          {doc.document_type}
                        </Badge>
                        <Badge className={`${statusColors[doc.status]} font-medium`}>
                          {doc.status}
                        </Badge>
                        {doc.company_ticker && (
                          <Badge variant="outline" className="border-slate-300 text-slate-600">
                            <Building2 className="w-3 h-3 mr-1" />
                            {doc.company_ticker}
                          </Badge>
                        )}
                        {doc.filing_date && (
                          <Badge variant="outline" className="border-slate-300 text-slate-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(doc.filing_date)}
                          </Badge>
                        )}
                      </div>
                      {doc.content_preview && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {doc.content_preview.slice(0, 150)}...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Uploaded {formatDate(doc.created_at)}
                    </div>
                    <div className="flex gap-2">
                      {doc.file_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-slate-600 hover:text-slate-900"
                        >
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Original
                          </a>
                        </Button>
                      )}
                      {doc.status === "ready" && (
                        <Link href={`/analysis?doc=${doc.id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Analyze
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}