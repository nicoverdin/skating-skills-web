import { createAdminClient } from '@/lib/supabase/admin'
import { updateUser } from '../actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditUserPage({ params }: { params: { id: string } }) {
  // Await params promise
  const { id } = await Promise.resolve(params)
  
  // Usamos el cliente Admin para poder leer el email del usuario (Auth)
  const supabaseAdmin = createAdminClient()

  // 1. Obtener perfil público
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  // 2. Obtener datos de login (email)
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(id)

  if (!profile || !user) notFound()

  // Preparamos la función con el ID
  // const updateUserWithId = updateUser.bind(null, id) -> Mejor lo pasamos como hidden input para simplificar

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Usuario</h1>
        <Link href="/dashboard/users" className="text-gray-500 hover:text-gray-700">Cancelar</Link>
      </div>

      <form action={updateUser} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <input type="hidden" name="id" value={profile.id} />

        {/* Selección de Rol */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <label className="block text-sm font-bold text-indigo-900 mb-2">Tipo de Usuario</label>
          <select 
            name="role" 
            defaultValue={profile.role}
            className="block w-full rounded-md border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="guardian">Tutor Legal (Padre/Madre)</option>
            <option value="coach">Entrenador / Staff</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Datos Personales */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input name="first_name" defaultValue={profile.first_name} type="text" required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input name="last_name" defaultValue={profile.last_name} type="text" required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
        </div>

        {/* Credenciales */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email de acceso</label>
            <input name="email" defaultValue={user.email} type="email" required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
            <input name="password" type="text" minLength={6} placeholder="Dejar en blanco para no cambiar" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
            <p className="text-xs text-gray-400 mt-1">Solo rellena esto si quieres cambiar su clave.</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Datos Extra */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input name="phone" defaultValue={profile.phone || ''} type="tel" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">IBAN (Facturación)</label>
            <input name="iban" defaultValue={profile.iban || ''} type="text" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
        </div>

        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          Guardar Cambios
        </button>
      </form>
    </div>
  )
}
