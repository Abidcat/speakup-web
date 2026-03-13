import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/DashboardNav'
import CursorGlow from '@/components/CursorGlow'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?login=true')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', cursor: 'none' }}>
      <CursorGlow />
      <DashboardNav user={user} />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 40px' }}>
        {children}
      </main>
    </div>
  )
}
