import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Safe date formatting function
const formatDate = (dateString) => {
  try {
    if (!dateString) return "Unknown date";
    return format(new Date(dateString), "MMM d, h:mm a");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

export default function RecentActivity({ questions, documents, isLoading }) {
  // Safety checks to ensure we have arrays
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safeDocuments = Array.isArray(documents) ? documents : [];

  const getDocumentTitle = (docId) => {
    const doc = safeDocuments.find(d => d.id === docId);
    return doc ? doc.title : "Unknown Document";
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="border-b border-slate-100 pb-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-32" />
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
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-slate-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {safeQuestions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No questions asked yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {safeQuestions.map((question, index) => (
              <div 
                key={question.id}
                className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-slate-800 to-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      {question.question_text}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{getDocumentTitle(question.document_id)}</span>
                      {question.processing_time && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {question.processing_time.toFixed(1)}s
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {formatDate(question.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}