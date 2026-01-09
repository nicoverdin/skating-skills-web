'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMonthlyBilling() {
  const supabase = await createClient()
  
  // Traemos el resumen de facturación
  const { data, error } = await supabase
    .from('student_billing_summary')
    .select('*')

  if (error) throw new Error(error.message)

  // Agrupamos por Tutor para el cobro bancario
  const totalsByGuardian = data.reduce((acc: any, curr) => {
    const id = curr.guardian_id
    if (!acc[id]) {
      acc[id] = {
        guardian_name: `${curr.guardian_first_name} ${curr.guardian_last_name}`,
        iban: curr.guardian_iban,
        total_fee: 0,
        students: []
      }
    }
    acc[id].total_fee += curr.monthly_fee_eur
    acc[id].students.push({
      name: `${curr.first_name} ${curr.last_name}`,
      fee: curr.monthly_fee_eur
    })
    return acc
  }, {})

  return Object.values(totalsByGuardian)
}

export async function closeMonthBilling() {
  const supabase = await createClient()
  
  // 1. Obtener datos actuales de la vista
  const { data: summary } = await supabase.from('student_billing_summary').select('*')
  if (!summary) return

  // 2. Agrupar por Tutor (un tutor, un recibo)
  const invoices = summary.reduce((acc: any, curr) => {
    const id = curr.guardian_id
    if (!acc[id]) {
      acc[id] = {
        guardian_id: id,
        month_year: new Date().toISOString().slice(0, 7) + "-01",
        total_amount: 0,
        iban_snapshot: curr.guardian_iban,
        status: 'pending'
      }
    }
    acc[id].total_amount += curr.monthly_fee_eur
    return acc
  }, {})

  // 3. Insertar en la tabla invoices
  const { error } = await supabase
    .from('invoices')
    .insert(Object.values(invoices))

  if (error) throw new Error("Error al cerrar el mes: " + error.message)

  revalidatePath('/dashboard/billing')
}

export async function exportBillingCSV() {
  const supabase = await createClient()
  const { data: summary } = await supabase.from('student_billing_summary').select('*')
  
  if (!summary) return ""

  // Cabeceras del CSV
  const header = ["Tutor", "IBAN", "Concepto", "Importe"].join(",")
  
  // Filas
  const rows = summary.map(item => [
    `${item.guardian_first_name} ${item.guardian_last_name}`,
    item.guardian_iban || "SIN_IBAN",
    `Cuota Patinaje - ${new Date().toLocaleString('es-ES', { month: 'long' })}`,
    `${item.monthly_fee_eur}€`
  ].join(","))

  return [header, ...rows].join("\n")
}
