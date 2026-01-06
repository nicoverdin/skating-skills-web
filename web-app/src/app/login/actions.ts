'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extract data from the form
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Attempt authentication
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // In a real app, we would return the error to the client to display it
    console.error('Login error:', error)
    redirect('/login?error=true')
  }

  // If successful, refresh cache and redirect to dashboard
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
