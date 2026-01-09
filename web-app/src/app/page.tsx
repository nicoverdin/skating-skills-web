import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="relative isolate">
      {/* Hero Section */}
      <div className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Aprende a patinar con los <span className="text-indigo-600">mejores</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Desde iniciación hasta competición nacional. Gestiona las inscripciones de tus hijos, 
            consulta horarios y sigue su progreso, todo desde nuestra plataforma online.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl hover:bg-indigo-500 transition active:scale-95"
            >
              Empezar ahora
            </Link>
            <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
              Saber más <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Pasos para los padres */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="font-bold text-xl mb-2">Regístrate</h3>
              <p className="text-gray-500 text-sm">Crea tu cuenta de tutor legal en menos de 1 minuto.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="font-bold text-xl mb-2">Añade Alumnos</h3>
              <p className="text-gray-500 text-sm">Introduce los datos del patinador y su nivel.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="font-bold text-xl mb-2">¡A patinar!</h3>
              <p className="text-gray-500 text-sm">El club asignará las clases y recibirás toda la información.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
