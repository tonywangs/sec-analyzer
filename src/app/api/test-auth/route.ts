import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH TEST START ===')
    
    // Test 1: Check if we can get the user from the request
    const user = await requireAuth(request)
    console.log('User from requireAuth:', {
      id: user.id,
      email: user.email,
      role: user.role
    })
    
    // Test 2: Check if we can get the user directly from Supabase
    const { data: { user: directUser }, error: directError } = await supabase.auth.getUser()
    console.log('Direct Supabase user:', {
      user: directUser ? { id: directUser.id, email: directUser.email } : null,
      error: directError
    })
    
    // Test 3: Check if we can get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Supabase session:', {
      session: session ? { user_id: session.user.id, expires_at: session.expires_at } : null,
      error: sessionError
    })
    
    // Test 4: Test the auth.uid() function in a query
    const { data: authTest, error: authTestError } = await supabase
      .from('documents')
      .select('auth.uid() as current_user_id')
      .limit(1)
    
    console.log('Auth.uid() test:', {
      data: authTest,
      error: authTestError
    })
    
    // Test 5: Try to insert a test document
    const testDocument = {
      title: 'Auth Test Document',
      content: 'Test content for authentication',
      user_id: user.id,
      status: 'ready'
    }
    
    console.log('Attempting to insert test document:', testDocument)
    
    const { data: insertResult, error: insertError } = await supabase
      .from('documents')
      .insert(testDocument)
      .select()
      .single()
    
    console.log('Insert result:', {
      data: insertResult,
      error: insertError
    })
    
    // Clean up the test document
    if (insertResult) {
      await supabase
        .from('documents')
        .delete()
        .eq('id', insertResult.id)
      console.log('Test document cleaned up')
    }
    
    console.log('=== AUTH TEST END ===')
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      directUser: directUser ? { id: directUser.id, email: directUser.email } : null,
      session: session ? { user_id: session.user.id } : null,
      authTest: authTest,
      insertTest: {
        success: !insertError,
        error: insertError
      }
    })
    
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 