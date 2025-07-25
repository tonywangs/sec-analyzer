'use client'

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AppSidebar from "@/components/layout/Sidebar";
import { authenticatedFetch } from '@/lib/api'

import FileUploadZone from "@/components/upload/FileUploadZone";
import ProcessingQueue from "@/components/upload/ProcessingQueue";
import DocumentPreview from "@/components/upload/DocumentPreview";

export default function Upload() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState([]);
  const [progress, setProgress] = useState([]);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === "application/pdf" || file.type === "text/plain"
    );

    if (droppedFiles.length === 0) {
      setError("Please upload PDF or TXT files only");
      return;
    }

    addFiles(droppedFiles);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      file => file.type === "application/pdf" || file.type === "text/plain"
    );

    if (selectedFiles.length === 0) {
      setError("Please upload PDF or TXT files only");
      return;
    }

    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles]);
    setProcessing(prev => [...prev, ...Array(newFiles.length).fill(false)]);
    setProgress(prev => [...prev, ...Array(newFiles.length).fill(0)]);
    setError(null);
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setProcessing(prev => prev.filter((_, index) => index !== indexToRemove));
    setProgress(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const processFile = async (file, index) => {
    setProcessing(prev => {
      const newProcessing = [...prev];
      newProcessing[index] = true;
      return newProcessing;
    });

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = [...prev];
          newProgress[index] = Math.min(80, (newProgress[index] || 0) + 10);
          return newProgress;
        });
      }, 200);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await authenticatedFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      clearInterval(progressInterval);
      
      if (response.ok) {
        setProgress(prev => {
          const newProgress = [...prev];
          newProgress[index] = 100;
          return newProgress;
        });
        
        setCurrentPreview({
          ...result,
          file_name: file.name,
          file_size: file.size
        });
      } else {
        throw new Error(result.error || "Could not process document");
      }
    } catch (error) {
      setError(`Error processing ${file.name}. Please try again.`);
      console.error("Error processing document:", error);
      removeFile(index);
    }

    setProcessing(prev => {
      const newProcessing = [...prev];
      newProcessing[index] = false;
      return newProcessing;
    });
  };

  const handleSaveDocument = async (documentData) => {
    try {
      console.log('Saving document with data:', documentData);
      const response = await authenticatedFetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData)
      });
      
      if (response.ok) {
        const fileIndex = files.findIndex(f => f.name === currentPreview.file_name);
        if (fileIndex !== -1) {
          removeFile(fileIndex);
        }
        setCurrentPreview(null);
        
        if (files.length <= 1) {
          router.push('/');
        }
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.details || 'Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError(`Error saving document: ${error.message}`);
    }
  };

  const cancelPreview = () => {
    const fileIndex = files.findIndex(f => f.name === currentPreview.file_name);
    if (fileIndex !== -1) {
      removeFile(fileIndex);
    }
    setCurrentPreview(null);
  };

  return (
    <AppSidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
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
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Upload SEC Filing</h1>
              <p className="text-slate-600 text-lg">
                Upload 10-K, 10-Q, or other SEC documents for AI-powered analysis
              </p>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-8">
            {!currentPreview && (
              <>
                <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-xl">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-slate-600" />
                      Upload Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <FileUploadZone 
                        onFileSelect={handleFileInput}
                        dragActive={dragActive}
                      />
                    </div>
                  </CardContent>
                </Card>

                {files.length > 0 && (
                  <ProcessingQueue 
                    files={files}
                    processing={processing}
                    progress={progress}
                    onRemoveFile={removeFile}
                    onProcessFile={processFile}
                  />
                )}
              </>
            )}

            {currentPreview && (
              <DocumentPreview
                documentData={currentPreview}
                onSave={handleSaveDocument}
                onCancel={cancelPreview}
              />
            )}
          </div>
        </div>
      </div>
    </AppSidebar>
  );
} 