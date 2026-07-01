import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { code } = await request.json()

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

    // Get the invite link
    const { data: invite, error: inviteError } = await supabase
      .from('invite_links')
      .select('*, groups(id, name, contribution_amount, admin_id)')
      .eq('code', code)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (inviteError || !invite) {
      return Response.json({ success: false, error: 'Invalid or expired invite link' }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', invite.group_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return Response.json({ success: true, groupId: invite.group_id, alreadyMember: true })
    }

    // Get user profile for name/email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single()

    // Add user as a member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: invite.group_id,
        user_id: user.id,
        email: user.email,
        name: profile?.full_name || user.email,
        phone: profile?.phone || null,
      })

    if (memberError) throw memberError

    return Response.json({ success: true, groupId: invite.group_id, alreadyMember: false })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
