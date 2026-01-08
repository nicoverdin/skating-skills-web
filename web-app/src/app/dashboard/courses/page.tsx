import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteCourse } from './actions'

export default async function CoursesDashboard() {
  const supabase = await createClient()

  // Traemos los cursos y hacemos un "JOIN" para sacar el nombre del entrenador
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      *,
      coach:coach_id (
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return <div className="p-8 text-red-500">Error cargando cursos.</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Cursos</h1>
          <p className="text-sm text-gray-500 mt-1">Temporadas, horarios y asignación de entrenadores.</p>
        </div>
        <Link 
          href="/dashboard/courses/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition"
        >
          + Nuevo Curso
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No hay cursos creados todavía.</p>
            <p className="text-sm text-gray-400 mt-1">Crea el primero para empezar a inscribir alumnos.</p>
          </div>
        ) : (
          courses?.map((course) => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {course.title}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase border ${
                    course.is_active 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {course.is_active ? 'Activo' : 'Cerrado'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {course.description || 'Sin descripción'}
                </p>
                
                <div className="space-y-3 pt-4 border-t border-gray-50">
                   {/* Entrenador */}
                   <div className="text-sm text-gray-700 flex items-center gap-2">
                    🧢 <span className="font-medium">
                      {/* @ts-ignore: Supabase types join fix */}
                      {course.coach ? `${course.coach.first_name} ${course.coach.last_name}` : 'Sin entrenador'}
                    </span>
                  </div>

                  {/* Horas */}
                  <div className="text-sm text-gray-700 flex items-center gap-2">
                    ⏱️ <span className="font-semibold text-indigo-600">{course.hours_per_week}h</span> / semana
                  </div>

                  {/* Fechas */}
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    📅 {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
                  </div>

                  {/* Capacidad */}
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    👥 Aforo máx: {course.capacity}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3 items-center">
                <span className="text-xs text-gray-300">ID: ...{course.id.slice(-4)}</span>
                
                {/* Delete Button */}
                <form action={deleteCourse}>
                  <input type="hidden" name="id" value={course.id} />
                  <button 
                    type="submit" 
                    className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline bg-white"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
