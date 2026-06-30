import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { userId, email } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
  .from('group_members')
  .update({ user_id: userId })
  .eq('email', email)
  .select()

    return Response.json({ success: true, linked: data?.length || 0 })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
