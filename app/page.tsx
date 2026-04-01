import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: persons, error } = await supabase
    .from('persons')
    .select('name, category')

  if (error) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1>❌ Supabase 연결 실패</h1>
        <pre style={{ color: 'red' }}>{error.message}</pre>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>✅ Supabase 연결 성공!</h1>
      <p>추적 중인 인물 목록:</p>
      <ul>
        {persons?.map((p) => (
          <li key={p.name}>{p.name} — {p.category}</li>
        ))}
      </ul>
    </main>
  )
}