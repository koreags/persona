import { createAdminClient } from '../../../lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data } = await supabase
    .from('persons')
    .select('id,name,name_en,category,active,post_count')
    .order('name', { ascending: true })
  return NextResponse.json(data || [])
}

export async function POST(req) {
  const { name, name_en, category } = await req.json()
  if (!name || !name_en) {
    return NextResponse.json({ error: '이름과 영문 이름은 필수입니다.' }, { status: 400 })
  }
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('persons')
    .insert({ name, name_en, category: category || '기타', active: true })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req) {
  const { id } = await req.json()
  const admin = createAdminClient()
  const { error } = await admin
    .from('persons')
    .update({ active: false })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
