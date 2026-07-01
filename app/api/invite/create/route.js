import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function POST(request) {
  try {
    const { groupId } = await request.json()

    const cookieStore = cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !user) {
      return Response.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check if an active invite link already exists for this group
    const { data: existing } = await supabase
      .from('invite_links')
      .select('code')
      .eq('group_id', groupId)
      .eq('created_by', user.id)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existing) {
      return Response.json({ success: true, code: existing.code })
    }

    // Create a new invite link
    const code = generateCode()
    const { error } = await supabase
      .from('invite_links')
      .insert({
        group_id: groupId,
        code,
        created_by: user.id,
      })

    if (error) throw error

    return Response.json({ success: true, code })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
