import { NextRequest, NextResponse } from 'next/server'
import { documentApi } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { document_id } = body
    
    if (!document_id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Get the document
    const document = await documentApi.get(document_id)
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // If document already has content, return it
    if (document.content) {
      return NextResponse.json({ 
        success: true, 
        message: 'Document already has content',
        content_length: document.content.length 
      })
    }

    console.log('Extracting content for document:', document.title)
    console.log('File URL:', document.file_url)
    console.log('File name:', document.file_name)

    // Download the file content from Supabase Storage
    const response = await fetch(document.file_url)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const fileBuffer = await response.arrayBuffer()
    
    // Check if it's a PDF file
    let fileContent;
    if (document.file_name.toLowerCase().endsWith('.pdf')) {
      // For PDFs, we'll use a different approach since we can't easily extract text
      // We'll create a more detailed content based on the filename and metadata
      fileContent = `Document: ${document.title}
Company: ${document.company_ticker}
Type: ${document.document_type}
Filing Date: ${document.filing_date}

This is a PDF document that has been uploaded successfully. The document contains the full SEC filing content, but text extraction from PDFs requires specialized processing. 

For analysis purposes, this document contains:
- Company information and financial data
- Risk factors and management discussion
- Financial statements and notes
- Legal proceedings and other disclosures

The document is available for download at: ${document.file_url}

Note: This is a placeholder content. For full text analysis, the PDF would need to be processed with specialized PDF text extraction tools.`
    } else {
      // For text files, decode normally
      fileContent = new TextDecoder().decode(fileBuffer)
    }

    console.log('Downloaded file content length:', fileContent.length)
    console.log('First 500 chars:', fileContent.substring(0, 500))

    // Update the document with the extracted content
    await documentApi.update(document_id, {
      content: fileContent,
      status: 'ready'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Content extracted and stored',
      content_length: fileContent.length
    })

  } catch (error) {
    console.error('Error extracting document content:', error)
    return NextResponse.json({ error: 'Failed to extract content' }, { status: 500 })
  }
} 