import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, X, Play, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ProcessingQueue({ 
  files, 
  processing, 
  progress, 
  onRemoveFile, 
  onProcessFile 
}) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-600" />
            Processing Queue ({files.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`border rounded-lg p-4 transition-all duration-300 ${
                processing[index] 
                  ? "border-slate-400 bg-slate-50" 
                  : progress[index] === 100 
                    ? "border-green-300 bg-green-50"
                    : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    file.type === "application/pdf" 
                      ? "bg-red-100 text-red-600" 
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{file.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-slate-500">
                        {formatFileSize(file.size)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {file.type === "application/pdf" ? "PDF" : "TXT"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {processing[index] ? (
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <div className="flex items-center gap-2 mb-1">
                          <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
                          <span className="text-xs text-slate-600">Processing...</span>
                        </div>
                        <Progress 
                          value={progress[index]} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ) : progress[index] === 100 ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onProcessFile(file, index)}
                      className="bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Process
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(index)}
                    className="text-slate-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-100">
          <Button
            onClick={() => onProcessFile(files[0], 0)}
            disabled={files.length === 0 || processing.some(p => p)}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500"
          >
            Process Next Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}