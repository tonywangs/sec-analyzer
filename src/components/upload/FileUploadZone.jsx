import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Upload, File } from "lucide-react";
import { motion } from "framer-motion";

export default function FileUploadZone({ onFileSelect, dragActive }) {
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`p-12 transition-all duration-300 ${
      dragActive ? "bg-slate-100" : "bg-white"
    }`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt"
        onChange={onFileSelect}
        className="hidden"
      />
      
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          animate={{ 
            scale: dragActive ? 1.05 : 1,
            rotate: dragActive ? 5 : 0
          }}
          transition={{ duration: 0.2 }}
          className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragActive 
              ? "bg-gradient-to-r from-slate-800 to-slate-600 shadow-lg" 
              : "bg-slate-100"
          }`}
        >
          {dragActive ? (
            <FileText className="w-10 h-10 text-white" />
          ) : (
            <Upload className="w-10 h-10 text-slate-600" />
          )}
        </motion.div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          {dragActive ? "Drop your files here" : "Upload SEC Filings"}
        </h3>
        
        <p className="text-slate-600 mb-8 text-lg leading-relaxed">
          Drag and drop your 10-K, 10-Q, or other SEC documents here, or click to browse. 
          We support PDF and TXT formats.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={handleBrowseClick}
            className="bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <File className="w-5 h-5 mr-3" />
            Choose Files
          </Button>
          
          <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>PDF</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>TXT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Max 50MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}