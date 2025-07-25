import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await requireAuth(request)
    
    console.log('Testing storage access for user:', user.id)
    
    // Test 1: Check if we can list buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return NextResponse.json({ 
        error: 'Cannot list storage buckets', 
        details: bucketsError.message 
      }, { status: 500 })
    }
    
    console.log('Available buckets:', buckets)
    
    // Test 2: Check if documents bucket exists
    const documentsBucket = buckets.find(bucket => bucket.name === 'documents')
    
    if (!documentsBucket) {
      return NextResponse.json({ 
        error: 'Documents bucket does not exist',
        availableBuckets: buckets.map(b => b.name)
      }, { status: 404 })
    }
    
    // Test 3: Check if we can list files in the documents bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('documents')
      .list()
    
    if (filesError) {
      console.error('Error listing files:', filesError)
      return NextResponse.json({ 
        error: 'Cannot list files in documents bucket', 
        details: filesError.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      user: user.id,
      buckets: buckets.map(b => b.name),
      documentsBucket: documentsBucket,
      filesInDocuments: files.length
    })
    
  } catch (error) {
    console.error('Error testing storage:', error)
    return NextResponse.json({ 
      error: 'Storage test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 