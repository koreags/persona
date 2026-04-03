import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '../../../../lib/supabase'
import { verifySessionToken, SESSION_COOKIE } from '../../../../lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const user  = verifySessionToken(token)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const selectFields = 'id,title,category,person_name,published_at,status,like_count,view_count,author_name,author_email,created_at'

  // 문자열 필터(`or(author_name.eq... , author_email.eq...)`)에서 값 escaping 이 꼬일 경우를 대비해
  // 작성자(닉네임) / 작성자(이메일) 각각을 조회한 뒤 합칩니다.
  const [{ data: byName, error: errByName }, { data: byEmail, error: errByEmail }] = await Promise.all([
    supabase
      .from('posts')
      .select(selectFields)
      .eq('author_name', user.nickname)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('posts')
      .select(selectFields)
      .eq('author_email', user.email)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (errByName) {
    console.error('[my-posts][byName]', errByName)
    return NextResponse.json({ error: errByName.message }, { status: 500 })
  }
  if (errByEmail) {
    console.error('[my-posts][byEmail]', errByEmail)
    return NextResponse.json({ error: errByEmail.message }, { status: 500 })
  }

  const merged = [...(byName || []), ...(byEmail || [])]
  const uniqueById = Array.from(new Map(merged.map(p => [p.id, p])).values())
  uniqueById.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 프론트에서는 created_at을 직접 쓰지 않지만, 응답 형태를 간단히 유지합니다.
  return NextResponse.json(uniqueById.slice(0, 50))
}
