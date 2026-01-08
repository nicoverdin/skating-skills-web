import { createClient } from '@/lib/supabase/server'
import { updateCourse } from '../actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  // Await params promise
  const { id } = await Promise.resolve(params)
  const supabase = await createClient()

  // 1. Obtener el Curso
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (!course) notFound()

  // 2. Obtener lista de Entrenadores (para el select)
  const { data: coaches } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .in('role', ['coach', 'admin']) // Permitimos asignar admins también si entrenan
    .order('last_name')

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Curso</h1>
        <Link href="/dashboard/courses" className="text-gray-500 hover:text-gray-700">
          Cancelar
        </Link>
      </div>

      <form action={updateCourse} className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6">
        <input type="hidden" name="id" value={course.id} />

        {/* Título y Estado */}
        <div className="flex justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Nombre del Curso</label>
            <input 
              type="text" 
              name="title" 
              defaultValue={course.title} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
            />
          </div>
          <div className="flex items-center pt-6">
             <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_active" 
                  defaultChecked={course.is_active} 
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-5 w-5" 
                />
                <span className="text-sm font-medium text-gray-700">Curso Activo</span>
             </label>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea 
            name="description" 
            rows={3} 
            defaultValue={course.description || ''} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
          ></textarea>
        </div>

        {/* Entrenador y Capacidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Entrenador Responsable</label>
            <select 
              name="coach_id" 
              defaultValue={course.coach_id || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            >
              <option value="">-- Sin asignar --</option>
              {coaches?.map(coach => (
                <option key={coach.id} value={coach.id}>
                  {coach.first_name} {coach.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Aforo Máximo</label>
            <input 
              type="number" 
              name="capacity" 
              defaultValue={course.capacity} 
              required 
              min="1" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
            />
          </div>
        </div>

        {/* Horarios y Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
           <div>
            <label className="block text-sm font-medium text-gray-700">Horas Semanales</label>
            <input 
              type="number" 
              step="0.5" 
              name="hours_per_week" 
              defaultValue={course.hours_per_week} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
            />
            <p className="text-xs text-gray-500 mt-1">Se usa para calcular la cuota.</p>
           </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <input 
              type="date" 
              name="start_date" 
              defaultValue={course.start_date} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
            />
           </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
            <input 
              type="date" 
              name="end_date" 
              defaultValue={course.end_date} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
            />
           </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link href="/dashboard/courses" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  )
}
