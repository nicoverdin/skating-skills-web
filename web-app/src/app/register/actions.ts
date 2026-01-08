'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message))
  }

  // Al registrarse, el Trigger de SQL que configuramos al principio (o nuestra lógica)
  // debe crear el perfil. Por seguridad, vamos a redirigir a una página de "Completar Perfil".
  redirect('/dashboard/onboarding')
}
