import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/login/actions' // Importamos la acción

export default async function Dashboard() {
  const supabase = await createClient()

  // 1. Get User Auth Data
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Get User Profile Data (Role, Name, etc.)
  // We use .single() because we expect exactly one profile per user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Control
          </h1>
          
          {/* Logout Button Form */}
          <form action={signOut}>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium">
              Cerrar Sesión
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* User Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900">Sesión Activa</h2>
            <p className="text-blue-800">Email: {user.email}</p>
            <p className="text-blue-800 mt-1">
              Rol detectado: <span className="font-bold uppercase badge bg-blue-200 px-2 py-1 rounded">{profile?.role || 'Sin Rol'}</span>
            </p>
          </div>

          {/* Conditional Rendering based on Role */}
          {profile?.role === 'admin' && (
            <div className="border border-indigo-200 rounded-lg p-6 bg-indigo-50">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Zona de Administración</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 bg-white rounded shadow text-left hover:bg-gray-50">
                  Gestionar Alumnos
                </button>
                <button className="p-4 bg-white rounded shadow text-left hover:bg-gray-50">
                  Gestionar Pagos
                </button>
                <button className="p-4 bg-white rounded shadow text-left hover:bg-gray-50">
                  Subir Fotos / Blog
                </button>
              </div>
            </div>
          )}

          {profile?.role === 'member' || profile?.role === 'guardian' ? (
            <div className="border border-green-200 rounded-lg p-6 bg-green-50">
              <h3 className="text-xl font-bold text-green-900 mb-4">⛸️ Zona de Socio</h3>
              <p>Aquí verás a tus hijos inscritos y tus recibos.</p>
            </div>
          ) : null}
          
        </div>
      </div>
    </div>
  )
}