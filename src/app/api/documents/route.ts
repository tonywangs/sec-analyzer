import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { createServerSupabaseClient, createAuthenticatedSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    
    // Get the user's JWT token from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization token provided')
    }
    const userToken = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Use authenticated Supabase client with user's JWT token
    const supabase = createAuthenticatedSupabaseClient(userToken)
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const { data: documents, error } = await query
    
    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }
    
    console.log('Documents API - Fetched documents:', {
      count: documents?.length || 0,
      userId: user.id
    })
    
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await requireAuth(request)
    
    const body = await request.json()
    
    console.log('Documents API - Creating document with data:', {
      title: body.title,
      hasContent: !!body.content,
      contentLength: body.content?.length || 0,
      contentPreview: body.content?.substring(0, 200) + '...',
      userId: user.id,
      userEmail: user.email
    })
    
    // Add user_id to the document data
    const documentData = {
      ...body,
      user_id: user.id,
      status: 'ready' // Ensure status is set
    }
    
    console.log('Documents API - Final document data being sent to database:', {
      ...documentData,
      contentLength: documentData.content?.length || 0
    })
    
    // Get the user's JWT token from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization token provided')
    }
    const userToken = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Use authenticated Supabase client with user's JWT token
    const supabase = createAuthenticatedSupabaseClient(userToken)
    const { data: document, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }
    
    console.log('Documents API - Document created successfully:', {
      id: document.id,
      title: document.title,
      hasContent: !!document.content,
      contentLength: document.content?.length || 0,
      userId: document.user_id,
      status: document.status
    })
    
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating document:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      details: (error as any)?.details,
      hint: (error as any)?.hint
    })
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
} 