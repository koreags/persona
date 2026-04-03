import AdminLoginForm from './ui'

export default async function AdminLoginPage({ searchParams }) {
  const nextPath =
    typeof searchParams?.next === 'string' && searchParams.next.trim()
      ? searchParams.next
      : '/admin'
  return <AdminLoginForm nextPath={nextPath} />
}

