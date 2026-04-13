import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { DEMO_TELEGRAM_ID } from '@/lib/mock-auth'

export async function getRequestUser() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')

  if (userId) {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && user) {
      return user
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const { data: demoUser, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', DEMO_TELEGRAM_ID)
      .single()

    if (!error && demoUser) {
      return demoUser
    }
  }

  return null
}