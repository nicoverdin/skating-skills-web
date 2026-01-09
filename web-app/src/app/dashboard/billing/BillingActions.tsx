'use client'

import { closeMonthBilling, exportBillingCSV } from './actions'

export default function BillingActions() {
  const handleExport = async () => {
    const csvContent = await exportBillingCSV()
    if (!csvContent) return
    
    // Crear un blob y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `remesa-${new Date().toISOString().slice(0,7)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex gap-4">
      <button 
        onClick={handleExport}
        className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
      >
        📥 Exportar CSV para Banco
      </button>

      <form action={closeMonthBilling}>
        <button 
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
        >
          ✅ Cerrar Mes
        </button>
      </form>
    </div>
  )
}
