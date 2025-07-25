'use client'

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AppSidebar from "@/components/layout/Sidebar";
import { authenticatedFetch } from '@/lib/api'

import DocumentSelector from "@/components/analysis/DocumentSelector";
import QuestionInterface from "@/components/analysis/QuestionInterface";
import AnswerDisplay from "@/components/analysis/AnswerDisplay";
import QuestionHistory from "@/components/analysis/QuestionHistory";

interface Document {
  id: string;
  title: string;
  company_ticker: string;
  document_type: string;
  filing_date: string;
  content_preview: string;
  content?: string; // Optional for backward compatibility
  file_url: string;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: string;
  document_id: string;
  question_text: string;
  answer: string;
  citations: string[];
  processing_time: number;
  conversation_id?: string;
  created_at: string;
  updated_at: string;
}

export default function Analysis() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<Question | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{ [key: string]: Question[] }>({});
  const conversationRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocument) {
      loadQuestions();
    }
  }, [selectedDocument]);

  // Auto-scroll to bottom of conversation when it updates
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversations, currentConversationId, currentQuestion]);

  const loadDocuments = async () => {
    try {
      const response = await authenticatedFetch('/api/documents?status=ready');
      const docs = await response.json();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocument) {
        setSelectedDocument(docs[0]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const loadQuestions = async () => {
    if (selectedDocument) {
      try {
        const response = await authenticatedFetch(`/api/questions?document_id=${selectedDocument.id}`);
        const qs = await response.json();
        setQuestions(qs);
        
        // Group questions by conversation
        const groupedConversations: { [key: string]: Question[] } = {};
        qs.forEach((q: Question) => {
          const convId = q.conversation_id || 'standalone';
          if (!groupedConversations[convId]) {
            groupedConversations[convId] = [];
          }
          groupedConversations[convId].push(q);
        });
        setConversations(groupedConversations);
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setCurrentAnswer(null);
  };

  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setCurrentAnswer(null);
  };

  const handleQuestionSubmit = async () => {
    if (!currentQuestion.trim() || !selectedDocument || isProcessing) return;

    // If no conversation is selected, start a new one
    if (!currentConversationId) {
      setCurrentConversationId(crypto.randomUUID());
    }

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // Generate AI answer with document context
      const response = await authenticatedFetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: selectedDocument.id,
          question: currentQuestion,
          conversation_id: currentConversationId
        })
      });

      const result = await response.json();
      const processingTime = (Date.now() - startTime) / 1000;

      if (response.ok) {
        // Save question and answer
        const citationsToSave = result.citations ? result.citations.map((citation: any) => 
          typeof citation === 'string' ? citation : citation.text
        ) : [];
        
        console.log('Saving citations to database:', {
          originalCitations: result.citations,
          processedCitations: citationsToSave
        });
        
        const questionResponse = await authenticatedFetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_id: selectedDocument.id,
            question_text: currentQuestion,
            answer: result.answer,
            citations: citationsToSave,
            processing_time: processingTime,
            conversation_id: currentConversationId
          })
        });

        if (questionResponse.ok) {
          const savedQuestion = await questionResponse.json();
          setCurrentAnswer({
            ...savedQuestion,
            confidence: result.confidence
          });
          
          setCurrentQuestion("");
          await loadQuestions();
        }
      } else {
        throw new Error(result.error || 'Failed to analyze document');
      }
    } catch (error) {
      console.error("Error processing question:", error);
    }

    setIsProcessing(false);
  };

  return (
    <AppSidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/')}
              className="border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Document Analysis</h1>
              <p className="text-slate-600 text-lg">
                Ask questions about your SEC filings and get AI-powered answers with citations
              </p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DocumentSelector 
                documents={documents}
                selectedDocument={selectedDocument}
                onSelectDocument={setSelectedDocument}
              />

              {selectedDocument && (
                <>
                  {/* Conversation Selector */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Conversations</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={startNewConversation}
                        >
                          New Conversation
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.keys(conversations).map((convId) => (
                          <div
                            key={convId}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              currentConversationId === convId
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => selectConversation(convId)}
                          >
                            <div className="font-medium">
                              {convId === 'standalone' ? 'Standalone Questions' : `Conversation ${convId.slice(0, 8)}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              {conversations[convId].length} question{conversations[convId].length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ))}
                        {Object.keys(conversations).length === 0 && (
                          <div className="text-gray-500 text-center py-4">
                            No conversations yet. Start by asking a question!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Conversation History View */}
                  {currentConversationId && conversations[currentConversationId] && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Conversation History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div ref={conversationRef} className="space-y-4 max-h-96 overflow-y-auto">
                          {conversations[currentConversationId]
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map((q, index) => (
                            <div key={q.id} className="space-y-3">
                              {/* Question Bubble */}
                              <div className="flex justify-end">
                                <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                                  <div className="text-sm font-medium">You</div>
                                  <div className="text-sm">{q.question_text}</div>
                                </div>
                              </div>
                              
                              {/* Answer Bubble */}
                              <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                                  <div className="text-sm font-medium text-gray-600">AI Assistant</div>
                                  <div className="text-sm">{q.answer}</div>
                                  {q.citations && q.citations.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <div className="text-xs text-gray-500 font-medium mb-1">Citations:</div>
                                      {q.citations.map((citation, citIndex) => (
                                        <div key={citIndex} className="text-xs text-gray-600 italic">
                                          "{typeof citation === 'string' ? citation : citation.text}"
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Current Question Being Typed */}
                          {currentQuestion.trim() && (
                            <div className="space-y-3">
                              <div className="flex justify-end">
                                <div className="bg-blue-300 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                                  <div className="text-sm font-medium">You (typing...)</div>
                                  <div className="text-sm">{currentQuestion}</div>
                                </div>
                              </div>
                              
                              {/* Loading indicator when processing */}
                              {isProcessing && (
                                <div className="flex justify-start">
                                  <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                                    <div className="text-sm font-medium text-gray-600">AI Assistant</div>
                                    <div className="text-sm text-gray-500">Thinking...</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <QuestionInterface 
                    question={currentQuestion}
                    onQuestionChange={setCurrentQuestion}
                    onSubmit={handleQuestionSubmit}
                    isProcessing={isProcessing}
                  />
                </>
              )}

              {currentAnswer && (
                <AnswerDisplay 
                  answer={currentAnswer}
                  document={selectedDocument}
                />
              )}
            </div>

            <div>
              <QuestionHistory 
                questions={questions}
                selectedDocument={selectedDocument}
                onSelectAnswer={setCurrentAnswer}
              />
            </div>
          </div>
        </div>
      </div>
    </AppSidebar>
  );
} 