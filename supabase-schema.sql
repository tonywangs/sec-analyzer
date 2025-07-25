-- SEC Analyzer Database Schema
-- Run this in your Supabase SQL Editor

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company_ticker TEXT,
  document_type TEXT,
  filing_date TEXT,
  content_preview TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  processing_time DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_questions_document_id ON questions(document_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to documents" ON documents;
DROP POLICY IF EXISTS "Allow public insert access to documents" ON documents;
DROP POLICY IF EXISTS "Allow public update access to documents" ON documents;
DROP POLICY IF EXISTS "Allow public delete access to documents" ON documents;

DROP POLICY IF EXISTS "Allow public read access to questions" ON questions;
DROP POLICY IF EXISTS "Allow public insert access to questions" ON questions;
DROP POLICY IF EXISTS "Allow public update access to questions" ON questions;
DROP POLICY IF EXISTS "Allow public delete access to questions" ON questions;

-- Create comprehensive policies for documents
CREATE POLICY "Allow public read access to documents" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to documents" ON documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to documents" ON documents
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to documents" ON documents
  FOR DELETE USING (true);

-- Create comprehensive policies for questions
CREATE POLICY "Allow public read access to questions" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to questions" ON questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to questions" ON questions
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to questions" ON questions
  FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at 
  BEFORE UPDATE ON questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage policies for the documents bucket
-- Note: You'll need to create the bucket first in the Supabase dashboard
-- Then run these policies

-- Allow public read access to documents bucket
CREATE POLICY "Allow public read access to documents bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Allow public insert access to documents bucket
CREATE POLICY "Allow public insert access to documents bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Allow public update access to documents bucket
CREATE POLICY "Allow public update access to documents bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');

-- Allow public delete access to documents bucket
CREATE POLICY "Allow public delete access to documents bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents'); 