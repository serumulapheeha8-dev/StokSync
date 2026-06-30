import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )

  let isRecovery = type === 'recovery'

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    // Supabase sometimes only tells us it's a recovery flow via the session's amr/type info,
    // but the type param from the URL is the most reliable signal we get from the email link.
  } else if (token_hash && type) {
    await supabase.auth.verifyOtp({ token_hash, type })
  }

  if (isRecovery) {
    return NextResponse.redirect(new URL('/reset-password', request.url))
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}