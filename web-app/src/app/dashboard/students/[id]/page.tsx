import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateStudent, deleteStudent } from './actions'
import { enrollStudent, unenrollStudent } from '../../enrollments/actions'

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params)
  const supabase = await createClient()

  // 0. COMPROBACIÓN DE SEGURIDAD Y ROL
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const isCoach = profile?.role === 'coach'
  const isStaff = isAdmin || isCoach

  // 1. Fetch Student Info
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (!student) notFound()

  // SEGURIDAD EXTRA: Si es tutor, verificar que el alumno sea suyo
  if (!isStaff && student.guardian_id !== user.id) {
    redirect('/dashboard') // No tiene permiso para ver este alumno
  }

  // 2. Fetch Guardians (Solo si es Admin para evitar fugas de datos de otros padres)
  const { data: guardians } = isAdmin 
    ? await supabase.from('profiles').select('id, first_name, last_name').order('last_name')
    : { data: [] }

  // 3. Fetch All Available Courses (Solo si es Staff, los padres no inscriben)
  const { data: allCourses } = isStaff 
    ? await supabase.from('courses').select('id, title, hours_per_week, start_date, end_date').eq('is_active', true).order('title')
    : { data: [] }

  // 4. Fetch Current Enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      course:course_id (
        id, title, hours_per_week, start_date, end_date
      )
    `)
    .eq('student_id', student.id)

  // 5. Business Logic
  // @ts-ignore
  const totalHours = enrollments?.reduce((acc, curr) => acc + (curr.course?.hours_per_week || 0), 0) || 0
  
  let estimatedFee = totalHours * 10 + 10

  const updateStudentWithId = updateStudent.bind(null, student.id)
  const deleteStudentWithId = deleteStudent.bind(null, student.id)

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isStaff ? `Expediente: ${student.first_name} ${student.last_name}` : `Ficha de ${student.first_name}`}
        </h1>
        <Link href="/dashboard/students" className="text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Datos Personales</h2>
            
            <form action={updateStudentWithId} className="space-y-4">
              {/* Tutor: Solo Admin puede cambiarlo. Padres solo ven texto. */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tutor Legal</label>
                {isAdmin ? (
                  <select name="guardian_id" defaultValue={student.guardian_id} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                    {guardians?.map((g) => (
                      <option key={g.id} value={g.id}>{g.last_name}, {g.first_name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 p-2 bg-gray-50 rounded border text-gray-600 text-sm">
                    Solo la administración puede cambiar el tutor asignado.
                  </p>
                )}
              </div>

              {/* Campos comunes: Los padres pueden editarlos (ej. alergias) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" name="first_name" defaultValue={student.first_name} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                  <input type="text" name="last_name" defaultValue={student.last_name} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Nacimiento</label>
                  <input type="date" name="date_of_birth" defaultValue={student.date_of_birth} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nivel</label>
                  {/* Los padres no deberían cambiarse de nivel ellos solos si el staff controla los grupos */}
                  <select name="skating_level" disabled={!isStaff} defaultValue={student.skating_level || 'preclub'} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 border p-2">
                    <option value="preclub">Pre-Club</option>
                    <option value="school">Escuela</option>
                    <option value="competition">Competición</option>
                    <option value="national">Nacional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Condiciones Médicas / Alergias</label>
                <textarea name="medical_conditions" rows={2} defaultValue={student.medical_conditions || ''} className="mt-1 block w-full rounded-md border-gray-300 border p-2"></textarea>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition">
                  Actualizar Ficha
                </button>
              </div>
            </form>

            {/* Zona de Peligro: Solo para Staff */}
            {isStaff && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Zona de administración</span>
                  <form action={deleteStudentWithId}>
                      <button type="submit" className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded transition">
                          🗑️ Eliminar Alumno
                      </button>
                  </form>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Inscripciones y Cuotas */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium opacity-90 uppercase tracking-wider">Cuota Mensual</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{estimatedFee}€</span>
              <span className="text-sm opacity-80">/ mes</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-sm">
              <span>Carga Horaria:</span>
              <span className="font-bold text-xl">{totalHours} h/sem</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-700">Cursos</h3>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {enrollments?.length === 0 ? (
                <li className="p-4 text-sm text-gray-500 text-center">Sin cursos asignados.</li>
              ) : (
                enrollments?.map((enrollment) => (
                  <li key={enrollment.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                      {/* @ts-ignore */}
                      <p className="font-medium text-gray-900 text-sm">{enrollment.course?.title}</p>
                      {/* @ts-ignore */}
                      <p className="text-xs text-gray-500">{enrollment.course?.hours_per_week}h semanales</p>
                    </div>
                    {/* Solo el Staff puede desinscribir */}
                    {isStaff && (
                      <form action={unenrollStudent}>
                        <input type="hidden" name="enrollment_id" value={enrollment.id} />
                        <input type="hidden" name="student_id" value={student.id} />
                        <button type="submit" className="text-gray-400 hover:text-red-600 p-1">
                          <span className="text-xl font-bold">&times;</span>
                        </button>
                      </form>
                    )}
                  </li>
                ))
              )}
            </ul>

            {/* Formulario de Inscripción: SOLO PARA STAFF */}
            {isStaff && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <form action={enrollStudent} className="flex gap-2">
                  <input type="hidden" name="student_id" value={student.id} />
                  <select name="course_id" className="flex-1 text-sm border-gray-300 rounded-md border p-2" required>
                    <option value="">+ Añadir curso...</option>
                    {allCourses?.map(c => (
                       // @ts-ignore
                       !enrollments?.some(e => e.course.id === c.id) && (
                         <option key={c.id} value={c.id}>{c.title} ({c.hours_per_week}h)</option>
                       )
                    ))}
                  </select>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium">
                    Añadir
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
