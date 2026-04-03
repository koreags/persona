import { createAdminClient } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('posts')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}