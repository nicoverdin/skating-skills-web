import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BillingActions from './BillingActions'
import { updateInvoiceStatus } from './actions'
import GuardianBilling from './GuardianBilling'

export default async function BillingPage() {
  const supabase = await createClient()
  
  // Verificación de seguridad: Solo Admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (!user) redirect('/login')

if (profile?.role !== 'admin') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Facturación</h1>
        <p className="text-gray-500 mb-8">Resumen de cuotas y estado de pagos.</p>
        <GuardianBilling userId={user.id} />
      </div>
    )
  }

  // Obtenemos los datos de la vista
  const { data: billingData } = await supabase
    .from('student_billing_summary')
    .select('*')

  const { data: pastInvoices } = await supabase
    .from('invoices')
    .select(`
      *,
      profiles:guardian_id (first_name, last_name)
    `)
    .order('month_year', { ascending: false })

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
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Histórico de Facturas Emitidas</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Importe</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pastInvoices?.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(inv.month_year).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {inv.profiles?.first_name} {inv.profiles?.last_name}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold">
                    {inv.total_amount}€
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                      inv.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {inv.status === 'paid' ? (
                      // CASO 1: YA ESTÁ PAGADO
                      // Mostramos un botón muy sutil para revertir en caso de error
                      <form action={async () => {
                        'use server'
                        await updateInvoiceStatus(inv.id, 'pending')
                      }}>
                        <button 
                          title="Marcar como pendiente de nuevo"
                          className="text-gray-400 hover:text-red-500 text-xs transition flex items-center justify-end gap-1 ml-auto"
                        >
                          <span>↩ Deshacer</span>
                        </button>
                      </form>
                    ) : (
                      // CASO 2: ESTÁ PENDIENTE O FALLIDO
                      // Botón principal para cobrar
                      <form action={async () => {
                        'use server'
                        await updateInvoiceStatus(inv.id, 'paid')
                      }}>
                        <button className="text-indigo-600 hover:text-indigo-900 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded transition">
                          Marcar Pagado
                        </button>
                      </form>
                    )}
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


