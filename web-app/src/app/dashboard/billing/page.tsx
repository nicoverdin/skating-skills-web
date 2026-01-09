import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BillingActions from './BillingActions'

export default async function BillingPage() {
  const supabase = await createClient()
  
  // Verificación de seguridad: Solo Admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Obtenemos los datos de la vista
  const { data: billingData } = await supabase
    .from('student_billing_summary')
    .select('*')

  // Calcular totales globales
  const totalRevenue = billingData?.reduce((acc, curr) => acc + curr.monthly_fee_eur, 0) || 0
  const totalStudents = billingData?.length || 0

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturación Mensual</h1>
          <p className="text-gray-500">Previsión de cobros</p>
        </div>
        
        {/* Usamos el componente de cliente aquí */}
        <BillingActions />
      </header>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">Ingresos Totales</p>
          <p className="text-3xl font-bold text-indigo-600">{totalRevenue}€</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">Alumnos Activos</p>
          <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-indigo-100 bg-indigo-50/30">
          <p className="text-sm font-medium text-indigo-600 uppercase">Ticket Medio</p>
          <p className="text-3xl font-bold text-indigo-700">
            {totalStudents > 0 ? (totalRevenue / totalStudents).toFixed(2) : 0}€
          </p>
        </div>
      </div>

      {/* Tabla de Cobros */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tutor / IBAN</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Alumnos</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Total Cuota</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {billingData?.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{item.guardian_first_name} {item.guardian_last_name}</div>
                  <div className="text-xs text-gray-400 font-mono uppercase">{item.guardian_iban || 'IBAN NO REGISTRADO'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.first_name}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                  {item.monthly_fee_eur}€
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700">
                    Pendiente
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
