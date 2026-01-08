import { createUser } from '../actions'
import Link from 'next/link'

export default function NewUserPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alta Manual de Usuario</h1>
        <Link href="/dashboard/users" className="text-gray-500 hover:text-gray-700">Cancelar</Link>
      </div>

      <form action={createUser} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Selección de Rol */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <label className="block text-sm font-bold text-indigo-900 mb-2">Tipo de Usuario</label>
          <select name="role" className="block w-full rounded-md border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="guardian">Tutor Legal (Padre/Madre)</option>
            <option value="coach">Entrenador / Staff</option>
            <option value="admin">Administrador</option>
          </select>
          <p className="text-xs text-indigo-600 mt-2">
            ℹ️ Los Tutores tienen acceso limitado. Los Entrenadores gestionan cursos.
          </p>
        </div>

        {/* Datos Personales */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input name="first_name" type="text" required placeholder="Ej. María" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input name="last_name" type="text" required placeholder="Ej. García" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
        </div>

        {/* Credenciales */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email de acceso</label>
            <input name="email" type="email" required placeholder="usuario@email.com" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña temporal</label>
            <input name="password" type="text" required minLength={6} placeholder="Ej. Patinaje2026" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Datos Extra */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input name="phone" type="tel" placeholder="600 000 000" className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">IBAN (Facturación)</label>
            <input name="iban" type="text" placeholder="ES00 ..." className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm border" />
          </div>
        </div>

        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
          Crear Usuario y Activar
        </button>
      </form>
    </div>
  )
}
