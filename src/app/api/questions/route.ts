import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('document_id')
    const conversationId = searchParams.get('conversation_id')
    const limit = searchParams.get('limit')
    
    // Get the user's JWT token from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization token provided')
    }
    const userToken = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Use authenticated Supabase client
    const supabase = createAuthenticatedSupabaseClient(userToken)
    let query = supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (documentId && conversationId) {
      // Get questions for a specific conversation
      query = query.eq('document_id', documentId).eq('conversation_id', conversationId)
    } else if (documentId) {
      // Get all questions for a document
      query = query.eq('document_id', documentId)
    }
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const { data: questions, error } = await query
    
    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }
    
    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await requireAuth(request)
    
    const body = await request.json()
    const { question_text, document_id, answer, citations, processing_time, conversation_id } = body

    // Get the user's JWT token from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization token provided')
    }
    const userToken = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Use authenticated Supabase client
    const supabase = createAuthenticatedSupabaseClient(userToken)

    console.log('Questions API - Received data:', {
      question_text,
      document_id,
      answer,
      citations,
      citationsType: typeof citations,
      citationsLength: citations?.length,
      processing_time,
      conversation_id,
      userId: user.id
    })

    if (!question_text || !document_id) {
      return NextResponse.json({ error: 'Missing question_text or document_id' }, { status: 400 })
    }

    // Create the question record with AI response
    const questionData = {
      document_id,
      question_text,
      answer: answer || '',
      citations: citations || [],
      processing_time: processing_time || 0,
      conversation_id: conversation_id || undefined,
      user_id: user.id
    }

    console.log('Questions API - Creating question with data:', questionData)

    // Use authenticated Supabase client to create the question
    const { data: question, error } = await supabase
      .from('questions')
      .insert(questionData)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }
    
    return NextResponse.json(question)
  } catch (error) {
    console.error('Error creating question:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
} 