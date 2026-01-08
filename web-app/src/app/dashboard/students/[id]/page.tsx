import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateStudent, deleteStudent } from './actions'
import { enrollStudent, unenrollStudent } from '../../enrollments/actions'

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  // Await params promise
  const { id } = await Promise.resolve(params)
  
  const supabase = await createClient()

  // 1. Fetch Student Info
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (!student) notFound()

  // 2. Fetch Guardians (for dropdown)
  const { data: guardians } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .order('last_name')

  // 3. Fetch All Available Courses (Active ones)
  // CORRECCIÓN AQUÍ: Quitamos 'schedule' y traemos fechas
  const { data: allCourses } = await supabase
    .from('courses')
    .select('id, title, hours_per_week, start_date, end_date') 
    .eq('is_active', true)
    .order('title')

  // 4. Fetch Current Enrollments for this Student
  // CORRECCIÓN AQUÍ: Quitamos 'schedule' de la relación también
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      course:course_id (
        id, title, hours_per_week, start_date, end_date
      )
    `)
    .eq('student_id', student.id)

  // 5. Calculate Business Logic (Total Hours & Fee)
  // @ts-ignore
  const totalHours = enrollments?.reduce((acc, curr) => acc + (curr.course?.hours_per_week || 0), 0) || 0
  
  // Ejemplo de lógica de precios:
  // < 2h: 35€ | 2-4h: 50€ | > 4h: 70€
  let estimatedFee = 0
  if (totalHours > 0) {
      if (totalHours <= 2) estimatedFee = 35
      else if (totalHours <= 4) estimatedFee = 50
      else estimatedFee = 70
  }

  // Bind actions
  const updateStudentWithId = updateStudent.bind(null, student.id)
  const deleteStudentWithId = deleteStudent.bind(null, student.id)

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Expediente: {student.first_name} {student.last_name}
        </h1>
        <Link href="/dashboard/students" className="text-gray-500 hover:text-gray-700">
          ← Volver al listado
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Student Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Datos Personales</h2>
            
            {/* FORMULARIO DE EDICIÓN PRINCIPAL */}
            <form action={updateStudentWithId} className="space-y-4">
              {/* Guardian */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tutor Legal</label>
                <select 
                  name="guardian_id" 
                  defaultValue={student.guardian_id}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                >
                  {guardians?.map((g) => (
                    <option key={g.id} value={g.id}>{g.last_name}, {g.first_name}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" name="first_name" defaultValue={student.first_name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                  <input type="text" name="last_name" defaultValue={student.last_name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
              </div>

              {/* Date & Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Nacimiento</label>
                  <input type="date" name="date_of_birth" defaultValue={student.date_of_birth} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nivel</label>
                  <select name="skating_level" defaultValue={student.skating_level || 'preclub'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                    <option value="preclub">Pre-Club</option>
                    <option value="school">Escuela</option>
                    <option value="competition">Competición</option>
                    <option value="national">Nacional</option>
                  </select>
                </div>
              </div>

              {/* Cond. Medicas */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Condiciones Médicas / Alergias</label>
                <textarea 
                  name="medical_conditions" 
                  rows={2} 
                  defaultValue={student.medical_conditions || ''} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                ></textarea>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition">
                  Guardar Datos
                </button>
              </div>
            </form>

            {/* SEPARADOR Y ZONA DE PELIGRO */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">Acciones destructivas</span>
                <form action={deleteStudentWithId}>
                    <button 
                        type="submit" 
                        className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded transition"
                    >
                        🗑️ Eliminar Alumno
                    </button>
                </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Enrollments & Billing */}
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium opacity-90 uppercase tracking-wider">Cuota Mensual Estimada</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{estimatedFee}€</span>
              <span className="text-sm opacity-80">/ mes</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-sm">
              <span>Carga Horaria:</span>
              <span className="font-bold text-xl">{totalHours} h/sem</span>
            </div>
          </div>

          {/* Enrollments List */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-700">Cursos Inscritos</h3>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {enrollments?.length === 0 ? (
                <li className="p-4 text-sm text-gray-500 text-center">No está inscrito en ningún curso.</li>
              ) : (
                enrollments?.map((enrollment) => (
                  <li key={enrollment.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                        {/* @ts-ignore */}
                      <p className="font-medium text-gray-900 text-sm">{enrollment.course?.title}</p>
                      <p className="text-xs text-gray-500">
                        {/* @ts-ignore */}
                        {enrollment.course?.hours_per_week}h • {new Date(enrollment.course?.start_date).getFullYear()}
                      </p>
                    </div>
                    <form action={unenrollStudent}>
                      <input type="hidden" name="enrollment_id" value={enrollment.id} />
                      <input type="hidden" name="student_id" value={student.id} />
                      <button type="submit" className="text-gray-400 hover:text-red-600 p-1" title="Desinscribir">
                        {/* Icono de basura/X simple */}
                        <span className="text-xl font-bold">&times;</span>
                      </button>
                    </form>
                  </li>
                ))
              )}
            </ul>

            {/* Add Enrollment Form */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <form action={enrollStudent} className="flex gap-2">
                <input type="hidden" name="student_id" value={student.id} />
                <select name="course_id" className="flex-1 text-sm border-gray-300 rounded-md shadow-sm border p-2" required>
                  <option value="">+ Añadir curso...</option>
                  {allCourses?.map(c => (
                     // Don't show courses already enrolled
                     // @ts-ignore
                     !enrollments?.some(e => e.course.id === c.id) && (
                        <option key={c.id} value={c.id}>{c.title} ({c.hours_per_week}h)</option>
                     )
                  ))}
                </select>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition">
                  Añadir
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
