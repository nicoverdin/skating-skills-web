import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateOnboarding } from './actions'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verificamos si ya tiene el perfil completo
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, iban')
    .eq('id', user.id)
    .single()

  // Si ya tiene nombre e IBAN, no hace falta que esté aquí
  if (profile?.first_name && profile?.iban) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-white shadow-xl rounded-2xl border border-indigo-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido al Club! 👋</h1>
      <p className="text-gray-500 mb-8">Para finalizar tu registro, necesitamos tus datos de contacto y facturación.</p>

      <form action={updateOnboarding} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input name="first_name" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input name="last_name" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2 border" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono móvil</label>
          <input name="phone" type="tel" required className="mt-1 block w-full border border-gray-300 rounded-md p-2 border" />
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
          <label className="block text-sm font-bold text-amber-900 mb-1">IBAN de Facturación</label>
          <input name="iban" type="text" required placeholder="ES00 0000..." className="mt-1 block w-full border border-amber-200 rounded-md p-2" />
          <p className="mt-2 text-xs text-amber-700 italic">
            * Usaremos esta cuenta para domiciliar las cuotas mensuales de los alumnos que inscribas.
          </p>
        </div>

        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">
          Completar Registro
        </button>
      </form>
    </div>
  )
}
