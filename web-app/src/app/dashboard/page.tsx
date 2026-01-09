import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Obtener el perfil del usuario actual para saber su ROL
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const isCoach = profile?.role === 'coach'

  // 2. Cargar datos según el rol
  let studentsCount = 0
  let totalIncome = 0

  if (isAdmin) {
    // Si es ADMIN: Carga global que ya teníamos
    const { count } = await supabase.from('students').select('*', { count: 'exact', head: true })
    studentsCount = count || 0
    
    const { data: incomeData } = await supabase.from('student_billing_summary').select('monthly_fee_eur')
    totalIncome = incomeData?.reduce((acc, curr) => acc + curr.monthly_fee_eur, 0) || 0
  } else {
    // Si es TUTOR: Solo sus propios hijos
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('guardian_id', user.id)
    studentsCount = count || 0

    const { data: myBilling } = await supabase
      .from('student_billing_summary')
      .select('monthly_fee_eur')
      .eq('guardian_id', user.id)
    totalIncome = myBilling?.reduce((acc, curr) => acc + curr.monthly_fee_eur, 0) || 0
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Bienvenido, {profile?.first_name} 
      </h1>

      {/* GRID DE ESTADÍSTICAS (Adaptado al Rol) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
          <dt className="text-sm font-medium text-gray-500 truncate">
            {isAdmin ? 'Alumnos Totales' : 'Mis Alumnos Inscritos'}
          </dt>
          <dd className="mt-1 text-3xl font-bold text-indigo-600">{studentsCount}</dd>
        </div>

        <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
          <dt className="text-sm font-medium text-gray-500 truncate">
            {isAdmin ? 'Ingresos Mensuales' : 'Mi Próxima Cuota'}
          </dt>
          <dd className="mt-1 text-3xl font-bold text-green-600">{totalIncome}€</dd>
        </div>
      </div>

      {/* ACCESOS RÁPIDOS FILTRADOS POR ROL */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">Gestión</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Los Padres solo ven "Mis Alumnos", los Admin ven "Gestionar Alumnos" */}
        <Link href="/dashboard/students" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 transition">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
            {isAdmin ? '🎓 Gestionar Alumnos' : '🎓 Alumnos'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {isAdmin ? 'Administrar todos los patinadores.' : 'Ver progreso e inscripciones.'}
          </p>
        </Link>

        {/* SOLO ADMINS VEN ESTO */}
        {isAdmin && (
          <>
            <Link href="/dashboard/users" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 transition">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">👥 Usuarios</h3>
              <p className="mt-2 text-sm text-gray-500">Gestionar staff y tutores.</p>
            </Link>

            <Link href="/dashboard/courses" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 transition">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">📅 Clases</h3>
              <p className="mt-2 text-sm text-gray-500">Configurar horarios y precios.</p>
            </Link>

            <Link href="/dashboard/billing" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 transition">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">💳 Facturación</h3>
              <p className="mt-2 text-sm text-gray-500">Gestión de cuotas, IBANs y remesas bancarias.</p>
            </Link>
          </>
        )}

        {/* Staff y Admin ven esto, Padres quizás solo lectura */}
        {(isAdmin || isCoach) && (
          <> {/* <--- Añade esto */}
            <Link href="/dashboard/blog" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 transition">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">📰 Blog</h3>
              <p className="mt-2 text-sm text-gray-500">Publicar noticias.</p>
            </Link>

            <Link href="/dashboard/gallery" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 transition">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">🖼️ Galería</h3>
              <p className="mt-2 text-sm text-gray-500">Gestionar galería.</p>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
