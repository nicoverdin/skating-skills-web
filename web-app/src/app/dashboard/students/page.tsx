import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// Helper function to calculate precise age
function calculateAge(dateString: string): number {
  const today = new Date();
  const birthDate = new Date(dateString);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  // If the current month is before the birth month, 
  // or if it's the birth month but the day hasn't passed yet:
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export default async function StudentsPage() {
  const supabase = await createClient()

  // 1. Fetch Students with their Guardian's info
  // The syntax `guardian_id (first_name, last_name, email)` is specific to Supabase/PostgREST
  // It effectively does a "JOIN" for us.
  const { data: students, error } = await supabase
    .from('students')
    .select(`
      *,
      guardian:guardian_id (
        first_name,
        last_name,
        phone
      )
    `)
    .order('last_name', { ascending: true })

  if (error) {
    return <div className="p-4 text-red-500">Error cargando alumnos: {error.message}</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Alumnos</h1>
        <Link 
          href="/dashboard/students/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Nuevo Alumno
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edad
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutor Legal
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay alumnos registrados aún.
                </td>
              </tr>
            ) : (
              students?.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${student.skating_level === 'preclub' ? 'bg-gray-100 text-gray-800' : ''}
                      ${student.skating_level === 'competition' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${student.skating_level === 'national' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {student.skating_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {calculateAge(student.date_of_birth)} años
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* We access the joined data safely */}
                    {/* @ts-ignore: TS sometimes complains about joined types deeply nested, ignore for now */}
                    {student.guardian?.first_name} {student.guardian?.last_name}
                    <div className="text-xs text-gray-400">{student.guardian?.phone || 'Sin teléfono'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/dashboard/students/${student.id}`} className="text-indigo-600 hover:text-indigo-900">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
