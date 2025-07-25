import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SUGGESTED_QUESTIONS = [
  "What were the key financial highlights for this period?",
  "What are the main risk factors mentioned?",
  "How has revenue changed compared to previous periods?",
  "What does management say about future outlook?",
  "Are there any material changes in operations?",
  "What are the significant accounting policies?"
];

export default function QuestionInterface({ 
  question, 
  onQuestionChange, 
  onSubmit, 
  isProcessing 
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-slate-600" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Textarea
            placeholder="What would you like to know about this document? Be specific for the best results..."
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] border-slate-300 focus:border-slate-500 resize-none"
            disabled={isProcessing}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Press Cmd/Ctrl + Enter to submit
            </p>
            <Button
              onClick={onSubmit}
              disabled={!question.trim() || isProcessing}
              className="bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Ask Question
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Suggested Questions</h4>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer border-slate-300 hover:bg-slate-100 transition-colors px-3 py-1"
                onClick={() => onQuestionChange(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}