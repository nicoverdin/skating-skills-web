import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateStudent, deleteStudent } from './actions'

// Next.js passes 'params' as a prop to page components
export default async function EditStudentPage({ params }: { params: { id: string } }) {
  // Await params because in latest Next.js versions params is a Promise
  const { id } = await Promise.resolve(params)
  
  const supabase = await createClient()

  // 1. Fetch the specific student
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !student) {
    notFound() // Shows the 404 page
  }

  // 2. Fetch guardians for the dropdown
  const { data: guardians } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .order('last_name')

  // We bind the ID to the server actions so they know which student to target
  const updateStudentWithId = updateStudent.bind(null, student.id)
  const deleteStudentWithId = deleteStudent.bind(null, student.id)

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Alumno</h1>
        
        {/* DELETE BUTTON (Separate small form) */}
        <form action={deleteStudentWithId}>
          <button 
            type="submit" 
            className="text-red-600 hover:text-red-900 text-sm font-medium border border-red-200 px-3 py-1 rounded bg-red-50"
            // Simple browser confirmation
            // Note: In a Server Action form, this onClick only prevents submission if false
            // It's a quick client-side check.
          >
            🗑️ Eliminar Alumno
          </button>
        </form>
      </div>

      <form action={updateStudentWithId} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
        
        {/* Guardian Dropdown */}
        <div>
          <label htmlFor="guardian_id" className="block text-sm font-medium text-gray-700">Tutor Legal</label>
          <select 
            name="guardian_id" 
            defaultValue={student.guardian_id}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            {guardians?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.last_name}, {g.first_name}
              </option>
            ))}
          </select>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input 
              type="text" 
              name="first_name" 
              defaultValue={student.first_name}
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input 
              type="text" 
              name="last_name" 
              defaultValue={student.last_name}
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
            />
          </div>
        </div>

        {/* Date & Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Nacimiento</label>
            <input 
              type="date" 
              name="date_of_birth" 
              defaultValue={student.date_of_birth}
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nivel Actual</label>
            <select 
              name="skating_level" 
              defaultValue={student.skating_level || 'preclub'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="preclub">Pre-Club</option>
              <option value="precompetition">Pre-Competición</option>
              <option value="competition">Competición</option>
              <option value="national">Nacional</option>
            </select>
          </div>
        </div>

        {/* Medical */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Condiciones Médicas</label>
          <textarea 
            name="medical_conditions" 
            rows={3} 
            defaultValue={student.medical_conditions || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-between items-center">
          <Link href="/dashboard/students" className="text-gray-600 hover:text-gray-900 text-sm">
            Cancelar
          </Link>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  )
}