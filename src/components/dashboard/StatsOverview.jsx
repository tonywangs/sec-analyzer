import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const statCards = [
  {
    title: "Total Documents",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600"
  },
  {
    title: "Questions Asked",
    icon: MessageSquare,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600"
  },
  {
    title: "Avg Response Time",
    icon: Clock,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-600"
  },
  {
    title: "Active Analysis",
    icon: TrendingUp,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600"
  }
];

export default function StatsOverview({ documents, questions, isLoading }) {
  // Safety checks to ensure we have arrays
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const safeQuestions = Array.isArray(questions) ? questions : [];

  const stats = {
    documents: safeDocuments.length,
    questions: safeQuestions.length,
    avgResponseTime: safeQuestions.length > 0 
      ? (safeQuestions.reduce((sum, q) => sum + (q.processing_time || 0), 0) / safeQuestions.length).toFixed(1)
      : "0",
    activeDocuments: safeDocuments.filter(d => d.status === "ready").length
  };

  const values = [
    stats.documents,
    stats.questions,
    `${stats.avgResponseTime}s`,
    stats.activeDocuments
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} rounded-full opacity-10 transform translate-x-8 -translate-y-8`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">
                  {values[index]}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}