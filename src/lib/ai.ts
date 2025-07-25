import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DocumentInfo {
  title: string;
  company_ticker: string;
  document_type: string;
  filing_date: string;
  content_preview: string;
}

export interface QuestionResponse {
  answer: string;
  citations: string[];
  processing_time: number;
}

export async function extractDocumentInfo(fileContent: string, filename?: string): Promise<DocumentInfo> {
  const startTime = Date.now();
  
  try {
    // Clean and prepare the content
    let cleanedContent = fileContent
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    console.log('Extracting document info from content:', {
      contentLength: cleanedContent.length,
      first500Chars: cleanedContent.substring(0, 500),
      isFallbackContent: cleanedContent.includes('PDF document uploaded successfully') || 
                        cleanedContent.includes('Document content extracted from PDF')
    });

    // Check if we have meaningful content to analyze
    const hasRealContent = cleanedContent.length > 100 && 
                          !cleanedContent.includes('PDF document uploaded successfully') && 
                          !cleanedContent.includes('Document content extracted from PDF') &&
                          !cleanedContent.includes('Text extraction failed') &&
                          !cleanedContent.includes('Error reading text file');

    if (!hasRealContent) {
      console.log('No meaningful content found, using filename-based fallback');
      // Use filename-based fallback when we don't have real content
      const filenameWithoutExt = filename?.replace(/\.pdf$/i, '') || 'Unknown Document';
      return {
        title: filenameWithoutExt,
        company_ticker: '',
        document_type: '10-Q', // Default assumption
        filing_date: '',
        content_preview: `This is a ${filenameWithoutExt} document. The document has been uploaded successfully and is available for analysis. Please review the original file for complete details.`
      };
    }

    // Truncate content for OpenAI (limit to ~8000 tokens, about 24,000 characters)
    const maxChars = 24000;
    const truncatedContent = cleanedContent.length > maxChars ? cleanedContent.slice(0, maxChars) : cleanedContent;

    // Create a focused prompt for document analysis
    const prompt = `
You are a financial document expert. Analyze the following SEC filing document and extract key information. Return your response in this exact format:

Title: [Document title or company name]
Company Ticker: [Stock ticker symbol if found, otherwise leave empty]
Document Type: [10-K, 10-Q, 8-K, or other filing type]
Filing Date: [Date in YYYY-MM-DD format if found, otherwise leave empty]
Preview: [A 2-3 sentence summary of the document's key content and purpose]

Document content:
${truncatedContent}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a financial document expert specializing in SEC filings.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    const processingTime = Date.now() - startTime;

    console.log('OpenAI response:', response);
    console.log('Processing time:', processingTime, 'ms');

    // Parse the response
    const lines = response.split('\n');
    const title = lines.find(line => line.startsWith('Title:'))?.replace('Title:', '').trim() || filename?.replace(/\.pdf$/i, '') || 'Unknown Document';
    const ticker = lines.find(line => line.startsWith('Company Ticker:'))?.replace('Company Ticker:', '').trim() || '';
    const docType = lines.find(line => line.startsWith('Document Type:'))?.replace('Document Type:', '').trim() || '10-K';
    const date = lines.find(line => line.startsWith('Filing Date:'))?.replace('Filing Date:', '').trim() || '';
    const preview = lines.find(line => line.startsWith('Preview:'))?.replace('Preview:', '').trim() || '';

    // Create a better content preview
    let finalPreview: string;
    if (preview && preview.length > 20) {
      finalPreview = preview;
    } else {
      // If AI didn't provide a good preview, create one from the content
      const contentPreview = cleanedContent.substring(0, 300).replace(/\n/g, ' ').trim();
      finalPreview = contentPreview.length > 50 ? 
        `${contentPreview}...` : 
        `Document content extracted successfully. Please review the original file for complete details.`;
    }

    return {
      title,
      company_ticker: ticker,
      document_type: docType,
      filing_date: date,
      content_preview: finalPreview
    };

  } catch (error) {
    console.error('Error in extractDocumentInfo:', error);
    
    // Fallback response
    const fallbackTitle = filename?.replace(/\.pdf$/i, '') || 'Unknown Document';
    const fallbackPreview = filename ? 
      `This is a ${fallbackTitle} document. The document has been uploaded successfully and is available for analysis.` :
      'Document content extracted from PDF. Please review the original file for complete details.';

    return {
      title: fallbackTitle,
      company_ticker: '',
      document_type: '10-Q',
      filing_date: '',
      content_preview: fallbackPreview
    };
  }
}

export async function analyzeDocument(question: string, documentContent: string): Promise<QuestionResponse> {
  const startTime = Date.now();
  
  try {
    // Clean and prepare the content
    let cleanedContent = documentContent
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    console.log('Analyzing document with content:', {
      originalLength: documentContent.length,
      cleanedLength: cleanedContent.length,
      first500Chars: cleanedContent.substring(0, 500),
      question: question
    });

    // Truncate content for OpenAI (limit to ~8000 tokens, about 24,000 characters)
    const maxChars = 24000;
    const truncatedContent = cleanedContent.length > maxChars ? cleanedContent.slice(0, maxChars) : cleanedContent;

    console.log('Content being sent to OpenAI:', {
      truncatedLength: truncatedContent.length,
      wasTruncated: cleanedContent.length > maxChars,
      first500Chars: truncatedContent.substring(0, 500)
    });

    // Create a focused prompt for question answering
    const prompt = `
You are a financial document expert. Answer the following question about the SEC filing document below. Provide a clear, accurate answer based on the document content. If the information is not available in the document, say so clearly.

Question: ${question}

Document content:
${truncatedContent}

Please provide your answer in a clear, professional manner. Focus on the specific information requested in the question.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a financial document expert specializing in SEC filings and financial analysis.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || '';
    const processingTime = Date.now() - startTime;

    console.log('OpenAI response received:', {
      answerLength: answer.length,
      answerPreview: answer.substring(0, 200),
      processingTime: processingTime
    });

    // For now, we'll use a simple citation approach
    // In a more sophisticated implementation, you could use embeddings to find specific sections
    const citations = ['Document content analysis'];

    return {
      answer,
      citations,
      processing_time: processingTime
    };

  } catch (error) {
    console.error('Error in analyzeDocument:', error);
    
    return {
      answer: 'I apologize, but I encountered an error while analyzing the document. Please try again or contact support if the issue persists.',
      citations: [],
      processing_time: Date.now() - startTime
    };
  }
} 