import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";

const DOCUMENT_TYPES = ["10-K", "10-Q", "8-K", "Other"];

export default function DocumentPreview({ documentData, onSave, onCancel }) {
  const [editedData, setEditedData] = useState({
    title: documentData.title || "",
    company_ticker: documentData.company_ticker || "",
    document_type: documentData.document_type || "10-K",
    filing_date: documentData.filing_date || "",
    content_preview: documentData.content_preview || "",
    content: documentData.content || "", // Add the content field
    file_url: documentData.file_url,
    file_name: documentData.file_name,
    file_size: documentData.file_size
  });

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-xl">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-6 h-6 text-slate-600" />
            Review Document Information
          </CardTitle>
          <p className="text-slate-600">Please verify and complete the document details</p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                  Document Title
                </Label>
                <Input
                  id="title"
                  value={editedData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter document title or company name"
                  className="border-slate-300 focus:border-slate-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ticker" className="text-sm font-semibold text-slate-700">
                  Company Ticker
                </Label>
                <Input
                  id="ticker"
                  value={editedData.company_ticker}
                  onChange={(e) => handleInputChange('company_ticker', e.target.value.toUpperCase())}
                  placeholder="e.g., AAPL"
                  className="border-slate-300 focus:border-slate-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="docType" className="text-sm font-semibold text-slate-700">
                  Document Type
                </Label>
                <Select
                  value={editedData.document_type}
                  onValueChange={(value) => handleInputChange('document_type', value)}
                >
                  <SelectTrigger className="border-slate-300 focus:border-slate-500">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filingDate" className="text-sm font-semibold text-slate-700">
                  Filing Date
                </Label>
                <Input
                  id="filingDate"
                  type="date"
                  value={editedData.filing_date}
                  onChange={(e) => handleInputChange('filing_date', e.target.value)}
                  className="border-slate-300 focus:border-slate-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preview" className="text-sm font-semibold text-slate-700">
                Content Preview
              </Label>
              <Textarea
                id="preview"
                value={editedData.content_preview}
                onChange={(e) => handleInputChange('content_preview', e.target.value)}
                placeholder="Brief description or excerpt from the document"
                className="border-slate-300 focus:border-slate-500 h-32 resize-none"
                rows={6}
              />
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">File Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Filename:</span>
                  <p className="font-medium text-slate-900">{documentData.file_name}</p>
                </div>
                <div>
                  <span className="text-slate-600">Size:</span>
                  <p className="font-medium text-slate-900">
                    {(documentData.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-8 py-6 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-300 hover:bg-slate-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Document
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}