import { createAdminClient } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { id } = await req.json()
  const admin = createAdminClient()
  const { error } = await admin
    .from('posts')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}