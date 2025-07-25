import { NextRequest, NextResponse } from 'next/server'
import { documentApi } from '@/lib/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const body = await request.json()
    
    const updatedDocument = await documentApi.update(documentId, body)
    
    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
} 