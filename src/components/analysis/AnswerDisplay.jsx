import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Quote, Clock, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AnswerDisplay({ answer, document }) {
  const [copiedAnswer, setCopiedAnswer] = React.useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAnswer(true);
      setTimeout(() => setCopiedAnswer(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return "High Confidence";
    if (confidence >= 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-slate-600" />
              Analysis Results
            </CardTitle>
            <div className="flex items-center gap-2">
              {answer.confidence && (
                <Badge className={getConfidenceColor(answer.confidence)}>
                  {getConfidenceLabel(answer.confidence)}
                </Badge>
              )}
              {answer.processing_time && (
                <Badge variant="outline" className="border-slate-300 text-slate-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {answer.processing_time.toFixed(1)}s
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Question</h3>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 font-medium">{answer.question_text}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Answer</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(answer.answer)}
                className="border-slate-300"
              >
                {copiedAnswer ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copiedAnswer ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="bg-gradient-to-r from-slate-800 to-slate-600 rounded-lg p-6 text-white">
              <p className="leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
            </div>
          </div>
          
          {answer.citations && answer.citations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Quote className="w-5 h-5" />
                Citations ({answer.citations.length})
              </h3>
              <div className="space-y-3">
                {answer.citations.map((citation, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="border-slate-300">
                        Citation {index + 1}
                        {citation.page && ` • Page ${citation.page}`}
                      </Badge>
                      {citation.relevance_score && (
                        <Badge variant="outline" className="border-slate-300">
                          {(citation.relevance_score * 100).toFixed(0)}% relevant
                        </Badge>
                      )}
                    </div>
                    <blockquote className="text-slate-700 italic leading-relaxed border-l-4 border-slate-300 pl-4">
                      "{typeof citation === 'string' ? citation : citation.text}"
                    </blockquote>
                  </div>
                ))}
              </div>
              
              {document && document.file_url && (
                <div className="pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    asChild
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Original Document
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}