import { createClient } from '@/lib/supabase/server'

export default async function GuardianBilling({ userId }: { userId: string }) {
  const supabase = await createClient()

  // 1. Previsión del mes actual (Vista)
  const { data: forecast } = await supabase
    .from('student_billing_summary')
    .select('*')
    .eq('guardian_id', userId)

  const currentTotal = forecast?.reduce((acc, curr) => acc + curr.monthly_fee_eur, 0) || 0

  // 2. Histórico de facturas (Tabla Invoices)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('guardian_id', userId)
    .order('month_year', { ascending: false })

  return (
    <div className="space-y-8">
      {/* TARJETA DE PREVISIÓN (LO QUE VIENE) */}
      <section className="bg-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-indigo-100 font-medium text-sm uppercase tracking-wide">Próximo Recibo Estimado</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{currentTotal}€</span>
              <span className="text-indigo-200 text-sm">/ este mes</span>
            </div>
            <p className="mt-4 text-sm text-indigo-100">
              Incluye las clases de: {forecast?.map(f => f.first_name).join(', ')}
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <span className="text-2xl">📅</span>
          </div>
        </div>
      </section>

      {/* TABLA DE HISTÓRICO (LO QUE YA PASÓ) */}
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Mis Recibos</h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {invoices && invoices.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Importe</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(inv.month_year).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      Cuota Mensual Club
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {inv.total_amount}€
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inv.status === 'paid' ? 'PAGADO' : 
                         inv.status === 'failed' ? 'ERROR' : 'PENDIENTE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No tienes recibos emitidos todavía.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
