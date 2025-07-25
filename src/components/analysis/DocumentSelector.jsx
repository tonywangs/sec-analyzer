import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Calendar } from "lucide-react";
import { format } from "date-fns";

const documentTypeColors = {
  "10-K": "bg-blue-100 text-blue-800 border-blue-200",
  "10-Q": "bg-green-100 text-green-800 border-green-200",
  "8-K": "bg-purple-100 text-purple-800 border-purple-200",
  "Other": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function DocumentSelector({ documents, selectedDocument, onSelectDocument }) {
  // Safety check to ensure we have an array
  const safeDocuments = Array.isArray(documents) ? documents : [];

  if (safeDocuments.length === 0) {
    return (
      <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No documents available</h3>
          <p className="text-slate-500">Upload a document first to start asking questions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-slate-600" />
          Select Document
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Select
            value={selectedDocument?.id || ""}
            onValueChange={(value) => {
              const doc = safeDocuments.find(d => d.id === value);
              onSelectDocument(doc);
            }}
          >
            <SelectTrigger className="w-full border-slate-300 focus:border-slate-500">
              <SelectValue placeholder="Choose a document to analyze" />
            </SelectTrigger>
            <SelectContent>
              {safeDocuments.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  <div className="flex items-center gap-2 py-1">
                    <span className="font-medium">{doc.title}</span>
                    <Badge className={`${documentTypeColors[doc.document_type]} text-xs`}>
                      {doc.document_type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedDocument && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={`${documentTypeColors[selectedDocument.document_type]} border`}>
                  {selectedDocument.document_type}
                </Badge>
                {selectedDocument.company_ticker && (
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    <Building2 className="w-3 h-3 mr-1" />
                    {selectedDocument.company_ticker}
                  </Badge>
                )}
                {selectedDocument.filing_date && (
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(selectedDocument.filing_date), "MMM d, yyyy")}
                  </Badge>
                )}
              </div>
              
              {selectedDocument.content_preview && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Content Preview</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedDocument.content_preview.slice(0, 300)}...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}