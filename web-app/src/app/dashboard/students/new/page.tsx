import { createClient } from '@/lib/supabase/server'
import { createStudent } from '../actions'
import Link from 'next/link'

export default async function NewStudentPage() {
  const supabase = await createClient()

  // 1. Obtenemos lista de posibles tutores (cualquier perfil en el sistema)
  // En el futuro podríamos filtrar solo por rol 'guardian' o 'member'
  const { data: guardians } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    // Ojo: Si 'email' no está en profile, pedimos solo nombre. 
    // Para identificar mejor, usaremos ID o Nombre.
    .select('id, first_name, last_name') 
    .order('last_name')

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Alumno</h1>
        <Link href="/dashboard/students" className="text-indigo-600 hover:text-indigo-900 text-sm">
          ← Cancelar
        </Link>
      </div>

      <form action={createStudent} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
        
        {/* Selección del Tutor */}
        <div>
          <label htmlFor="guardian_id" className="block text-sm font-medium text-gray-700">Tutor Legal *</label>
          <select 
            name="guardian_id" 
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="">-- Selecciona un Tutor --</option>
            {guardians?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.last_name}, {g.first_name} (ID: {g.id.slice(0,4)}...)
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">El alumno quedará vinculado a la cuenta de este usuario.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input type="text" name="first_name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Apellidos *</label>
            <input type="text" name="last_name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Fecha Nacimiento *</label>
            <input type="date" name="date_of_birth" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
          </div>
          <div>
            <label htmlFor="skating_level" className="block text-sm font-medium text-gray-700">Nivel Inicial</label>
            <select name="skating_level" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option value="preclub">Pre-Club (Iniciación)</option>
              <option value="precompetition">Pre-Competición</option>
              <option value="competition">Competición</option>
              <option value="national">Nacional</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="medical_conditions" className="block text-sm font-medium text-gray-700">Alergias / Condiciones Médicas</label>
          <textarea name="medical_conditions" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"></textarea>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Guardar Alumno
          </button>
        </div>
      </form>
    </div>
  )
}