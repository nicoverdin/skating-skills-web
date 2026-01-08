import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Total Alumnos Activos
  const { count: studentsCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })

  // 2. Total Cursos Activos
  const { count: coursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // 3. Estimación de Ingresos (Usando la Vista SQL)
  // Si la vista no devuelve datos, asumimos 0
  const { data: incomeData } = await supabase
    .from('student_billing_summary')
    .select('monthly_fee_eur')
  
  // Sumamos el total de todas las cuotas
  const totalIncome = incomeData?.reduce((acc, curr) => acc + curr.monthly_fee_eur, 0) || 0

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Control</h1>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        
        {/* Card 1: Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <span className="text-2xl">⛸️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Alumnos Totales</dt>
                  <dd className="text-3xl font-bold text-gray-900">{studentsCount || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link href="/dashboard/students" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
              Ver listado completo
            </Link>
          </div>
        </div>

        {/* Card 2: Income */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Ingresos Mensuales</dt>
                  <dd className="text-3xl font-bold text-gray-900">{totalIncome}€</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm text-gray-500">Estimación basada en inscripciones</div>
          </div>
        </div>

        {/* Card 3: Active Courses */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cursos Activos</dt>
                  <dd className="text-3xl font-bold text-gray-900">{coursesCount || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
             <Link href="/dashboard/courses" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
              Gestionar horarios
            </Link>
          </div>
        </div>

      </div>

      {/* QUICK LINKS */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        
        <Link href="/dashboard/students" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">🎓 Gestionar Alumnos</h3>
          <p className="mt-2 text-sm text-gray-500">Matricular nuevos patinadores y editar fichas.</p>
        </Link>

        <Link href="/dashboard/courses" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">📅 Cursos y Horarios</h3>
          <p className="mt-2 text-sm text-gray-500">Crear nuevas temporadas y grupos.</p>
        </Link>

        <Link href="/dashboard/gallery" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">📸 Galería de Fotos</h3>
          <p className="mt-2 text-sm text-gray-500">Subir imágenes a la web pública.</p>
        </Link>

        <Link href="/dashboard/blog" className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition cursor-pointer">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">📰 Noticias / Blog</h3>
          <p className="mt-2 text-sm text-gray-500">Publicar novedades para los padres.</p>
        </Link>

      </div>
    </div>
  )
}
