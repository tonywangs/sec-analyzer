import { NextRequest, NextResponse } from 'next/server'
import { documentApi } from '@/lib/api'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const body = await request.json()
    const { content } = body
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Update the document with the provided content
    const updatedDocument = await documentApi.update(documentId, {
      content: content,
      status: 'ready'
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Content added successfully',
      document: updatedDocument
    })
  } catch (error) {
    console.error('Error adding content to document:', error)
    return NextResponse.json({ error: 'Failed to add content' }, { status: 500 })
  }
} 