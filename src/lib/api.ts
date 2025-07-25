import { supabase, Document, Question } from './supabase'

// Custom fetch function that includes auth token
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  // Only set Content-Type if it's not already set and we're not sending FormData
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// Document operations
export const documentApi = {
  async list(orderBy = '-created_at', limit?: number) {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data as Document[]
  },

  async filter(filters: Partial<Document>, orderBy = '-created_at') {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query
    if (error) throw error
    return data as Document[]
  },

  async create(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single()
    
    if (error) throw error
    return data as Document
  },

  async update(id: string, updates: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Document
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Document
  }
}

// Question operations
export const questionApi = {
  async list(orderBy = '-created_at', limit?: number) {
    let query = supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data as Question[]
  },

  async filter(filters: Partial<Question>, orderBy = '-created_at') {
    let query = supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query
    if (error) throw error
    return data as Question[]
  },

  async create(question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single()
    
    if (error) throw error
    return data as Question
  },

  async update(id: string, updates: Partial<Question>) {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Question
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Question
  }
}

// File upload operations
export const fileApi = {
  async upload(file: File, bucket = 'documents') {
    try {
      console.log('Starting file upload to Supabase storage...')
      console.log('File details:', { name: file.name, size: file.size, type: file.type })
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      console.log('Generated filename:', fileName)
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)
      
      if (error) {
        console.error('Supabase storage upload error:', error)
        throw error
      }
      
      console.log('File uploaded successfully to storage:', data)
      
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)
      
      console.log('Generated public URL:', urlData.publicUrl)
      
      return {
        file_url: urlData.publicUrl,
        file_name: fileName
      }
    } catch (error) {
      console.error('Error in fileApi.upload:', error)
      throw error
    }
  },

  async delete(fileName: string, bucket = 'documents') {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])
    
    if (error) throw error
  }
} 