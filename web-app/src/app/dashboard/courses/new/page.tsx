import { createClient } from '@/lib/supabase/server' // Necesario para cargar coaches
import { createCourse } from '../actions'
import Link from 'next/link'

export default async function NewCoursePage() {
  const supabase = await createClient()

  // Cargamos la lista de entrenadores (profiles) para el select
  // Asumimos que cualquier perfil puede ser coach, o filtramos por rol si lo tienes
  const { data: coaches } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .order('last_name')

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nueva Clase</h1>
        <Link href="/dashboard/courses" className="text-gray-500">Cancelar</Link>
      </div>

      <form action={createCourse} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
        
        {/* Título y Coach */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la Clase*</label>
            <input name="title" type="text" required placeholder="Ej. Pre-Competición 2026" className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Entrenador Principal</label>
            <select name="coach_id" className="mt-1 block w-full rounded-md border border-gray-300 p-2">
              <option value="">-- Sin asignar --</option>
              {coaches?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea name="description" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 p-2" placeholder="Detalles del curso..."></textarea>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Inicio *</label>
            <input name="start_date" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Fin *</label>
            <input name="end_date" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>
        </div>

        {/* Métricas Numéricas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Horas Semanales *</label>
            <input name="hours_per_week" type="number" step="0.5" required placeholder="1.5" className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Capacidad Máxima *</label>
            <input name="capacity" type="number" required placeholder="20" className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>
        </div>

        {/* Activo */}
        <div className="flex items-center">
            <input 
              id="is_active" 
              name="is_active" 
              type="checkbox" 
              defaultChecked
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Clase Activa (Visible para inscripciones)
            </label>
          </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Crear Clase
        </button>
      </form>
    </div>
  )
}
