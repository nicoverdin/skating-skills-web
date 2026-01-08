'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createUser(formData: FormData) {
  // 1. Verificar seguridad: ¿Quien llama es Admin/Staff?
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  // 2. Usamos la llave maestra para crear el otro usuario
  const supabaseAdmin = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const role = formData.get('role') as string // 'guardian', 'coach', 'admin'
  const iban = formData.get('iban') as string || null
  const phone = formData.get('phone') as string || null

  // 3. Crear usuario en Auth (con email confirmado automáticamente)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName }
  })

  if (authError) {
    console.error('Error Auth:', authError)
    throw new Error('Error creando usuario: ' + authError.message)
  }

  if (!authData.user) throw new Error('No se generó usuario')

  // 4. Crear el perfil en la tabla pública
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      role: role,
      phone: phone,
      iban: iban
    })

  if (profileError) {
    // Si falla el perfil, borramos el usuario Auth para no dejar basura
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    console.error('Error Profile:', profileError)
    throw new Error('Error guardando datos del perfil')
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}

export async function deleteUser(formData: FormData) {
  const supabaseAdmin = createAdminClient()
  const userId = formData.get('id') as string

  // Al borrar de Auth, el "ON DELETE CASCADE" de SQL borrará el perfil solo
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    console.error('Error delete:', error)
    throw new Error('Error eliminando usuario')
  }

  revalidatePath('/dashboard/users')
}

export async function updateUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const supabaseAdmin = createAdminClient()

  const id = formData.get('id') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const role = formData.get('role') as string
  const iban = formData.get('iban') as string || null
  const phone = formData.get('phone') as string || null

  // 1. Actualizar datos públicos (Profile)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      role: role,
      iban: iban,
      phone: phone,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (profileError) throw new Error('Error actualizando perfil')

  // 2. Actualizar datos de Acceso (Auth: Email y Password)
  // Solo incluimos la contraseña si el admin escribió algo nuevo
  const authUpdates: any = { email }
  if (password && password.trim() !== '') {
    authUpdates.password = password
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    id,
    authUpdates
  )

  if (authError) throw new Error('Error actualizando credenciales: ' + authError.message)

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}
