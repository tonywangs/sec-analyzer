import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Eye } from "lucide-react";
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

export default function QuestionHistory({ 
  questions, 
  selectedDocument, 
  onSelectAnswer 
}) {
  // Safety check to ensure we have an array
  const safeQuestions = Array.isArray(questions) ? questions : [];

  if (!selectedDocument) {
    return (
      <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Select a document to view question history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-slate-600" />
          Question History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {safeQuestions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">No questions yet</p>
            <p className="text-sm text-slate-400">Ask your first question to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {safeQuestions.map((question) => (
              <div 
                key={question.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 bg-white/50"
              >
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-900 leading-relaxed">
                    {question.question_text}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-slate-300 text-slate-600 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(question.created_at)}
                      </Badge>
                      {question.processing_time && (
                        <Badge variant="outline" className="border-slate-300 text-slate-600 text-xs">
                          {question.processing_time.toFixed(1)}s
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectAnswer(question)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                  
                  {question.answer && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {question.answer.slice(0, 120)}...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}