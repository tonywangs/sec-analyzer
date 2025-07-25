import { NextRequest, NextResponse } from 'next/server'
import { extractDocumentInfo, analyzeDocument } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType, content, filename, question } = body

    if (testType === 'extract') {
      const result = await extractDocumentInfo(content, filename)
      return NextResponse.json({ success: true, result })
    } else if (testType === 'analyze') {
      const result = await analyzeDocument(question, content)
      return NextResponse.json({ success: true, result })
    } else {
      return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Test AI error:', error)
    return NextResponse.json({ error: 'AI test failed' }, { status: 500 })
  }
} 