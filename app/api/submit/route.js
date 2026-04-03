// app/api/submit/route.js
import { createAdminClient } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { person, title, category, content, author, email, source } = await req.json()
  if (!person || !title || !content) return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 })

  const admin = createAdminClient()

  const { data: personRow } = await admin.from('persons').select('id').eq('name', person).maybeSingle()

  const now = new Date().toISOString()

  const { error } = await admin.from('posts').insert({
    person_id:    personRow?.id ?? null,
    person_name:  person,
    title,
    category:     category || '기타',
    content,
    excerpt:      content.slice(0, 200).replace(/\n/g, ' ') + '...',
    post_type:    'user',
    status:       'published',
    author_name:  author || '익명',
    author_email: email || null,
    sources:      source ? JSON.stringify([{ url: source }]) : null,
    submitted_at: now,
    published_at: now,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
