import { createClient } from '@/lib/supabase/server'
import { createStudent } from '../actions'
import Link from 'next/link'

export default async function NewStudentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, first_name, last_name')
    .eq('id', user?.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const { data: guardians } = isAdmin 
    ? await supabase.from('profiles').select('id, first_name, last_name').order('last_name')
    : { data: [] }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Matricular Alumno</h1>
        <p className="text-gray-500 text-sm">Introduce los datos del patinador/a.</p>
      </div>

      <form action={createStudent} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* SECCIÓN TUTOR */}
        {isAdmin ? (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tutor Legal</label>
            <select name="guardian_id" required className="block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Selecciona un tutor...</option>
              {guardians?.map((g) => (
                <option key={g.id} value={g.id}>{g.last_name}, {g.first_name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <p className="text-sm text-indigo-800">
              <span className="font-bold">Tutor Responsable:</span> {profile?.first_name} {profile?.last_name}
            </p>
            <input type="hidden" name="guardian_id" value={profile?.id} />
          </div>
        )}

        {/* DATOS PERSONALES DEL ALUMNO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Alumno</label>
            <input name="first_name" type="text" required placeholder="Ej: Lucía" className="mt-1 block w-full border border-gray-300 rounded-md p-2 border shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input name="last_name" type="text" required placeholder="Ej: García López" className="mt-1 block w-full border border-gray-300 rounded-md p-2 border shadow-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
            <input 
              name="date_of_birth" 
              type="date" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 border shadow-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nivel de Patinaje</label>
            <select name="skating_level" required className="mt-1 block w-full border border-gray-300 rounded-md p-2 border shadow-sm">
              <option value="preclub">Escuela / Pre-Club</option>
              <option value="precompetition">Pre-Competición</option>
              <option value="competition">Competición</option>
              <option value="national">Nacional</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Asegúrate de que el valor coincida con: preclub, precompetition, competition o national.
            </p>
          </div>       
        </div>

        {/* INFORMACIÓN MÉDICA */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Información Médica / Alergias</label>
          <textarea 
            name="medical_conditions" 
            rows={3} 
            placeholder="Indica si padece asma, alergias alimentarias, lesiones previas..."
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 border shadow-sm"
          ></textarea>
          <p className="mt-2 text-xs text-gray-400 italic">Esta información es confidencial y solo la verá el equipo técnico.</p>
        </div>

        <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100">
          <Link href="/dashboard/students" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 transition">
            Cancelar
          </Link>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition transform active:scale-95">
            Matricular Alumno
          </button>
        </div>
      </form>
    </div>
  )
}
