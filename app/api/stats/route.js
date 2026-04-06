import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('site_stats')
    .select('total_visits, today_visits, date')
    .eq('id', 1)
    .single()

  if (error) return NextResponse.json({ total_visits: 0, today_visits: 0 })
  return NextResponse.json(data)
}

export async function POST() {
  const supabase = getSupabase()
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

  const { data, error } = await supabase
    .from('site_stats')
    .select('total_visits, today_visits, date')
    .eq('id', 1)
    .single()

  if (error || !data) return NextResponse.json({ ok: false }, { status: 500 })

  const isSameDay = data.date === today
  const updates = {
    total_visits: (data.total_visits ?? 0) + 1,
    today_visits: isSameDay ? (data.today_visits ?? 0) + 1 : 1,
    date: today,
  }

  await supabase.from('site_stats').update(updates).eq('id', 1)
  return NextResponse.json({ ok: true, ...updates })
}
