import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()

  // Security check: Get the current user
  const { data: { user }, error } = await supabase.auth.getUser()

  // If no user, kick them back to login
  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Bienvenido al Panel Privado</h1>
      <p>Estás logueado como: {user.email}</p>
      <p className="mt-4 text-sm text-gray-500">ID: {user.id}</p>
    </div>
  )
}
