import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⛸️</span>
            <span className="font-bold text-xl tracking-tight text-gray-900">Skating Skills</span>
          </Link>

          {/* Botones de Acción */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
              Noticias
            </Link>
            <Link href="/gallery" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
              Galería
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                href="/dashboard" 
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full transition"
              >
                Ir a mi Panel
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/register" 
                  className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
                >
                  Inscribirse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
