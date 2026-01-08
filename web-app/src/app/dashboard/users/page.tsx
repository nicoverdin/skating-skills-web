import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteUser } from './actions'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
          <p className="text-sm text-gray-500">Gestión manual de Padres, Entrenadores y Administradores.</p>
        </div>
        <Link 
          href="/dashboard/users/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow-sm"
        >
          + Alta Manual
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {profiles?.map((profile) => (
            <li key={profile.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    profile.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    profile.role === 'coach' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                }`}>
                    {profile.first_name[0]}{profile.last_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{profile.first_name} {profile.last_name}</span>
                    <span className="text-xs text-gray-400 border px-1 rounded uppercase">{profile.role}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5 flex gap-3">
                     {profile.phone && <span>📞 {profile.phone}</span>}
                     {profile.iban && <span className="font-mono text-xs bg-gray-100 px-1 rounded">💳 IBAN OK</span>}
                  </div>
                </div>
              </div>

              {/* Botón EDITAR */}
               <Link 
                  href={`/dashboard/users/${profile.id}`}
                  className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded transition"
                  title="Editar usuario"
               >
                  ✏️
              </Link>
              
              <form action={deleteUser}>
                <input type="hidden" name="id" value={profile.id} />
                <button type="submit" className="text-gray-400 hover:text-red-600 transition">
                  <span className="sr-only">Eliminar</span>
                  🗑️
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
