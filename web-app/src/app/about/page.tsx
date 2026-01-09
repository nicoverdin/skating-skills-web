import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* SECCIÓN: Quiénes somos */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
              Pasión por el patinaje desde la base
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              En <strong>Skating Skills</strong>, no solo enseñamos a patinar; fomentamos valores como el compañerismo, la disciplina y la superación personal.
            </p>
            <p className="text-lg text-gray-600">
              Nuestra escuela nació con el objetivo de profesionalizar la enseñanza del patinaje artístico, ofreciendo un entorno seguro y divertido para todas las edades.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl rotate-2">
            <img 
              src="https://images.unsplash.com/photo-1517177646040-d8ef3947d6d4?auto=format&fit=crop&q=80&w=800" 
              alt="Entrenamiento de patinaje" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* SECCIÓN: Nuestros Valores */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-12">Nuestros Pilares</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <span className="text-4xl mb-4 block">🛡️</span>
              <h3 className="text-xl font-bold mb-2">Seguridad</h3>
              <p className="opacity-90">Protocolos estrictos y material homologado para cada nivel.</p>
            </div>
            <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <span className="text-4xl mb-4 block">📈</span>
              <h3 className="text-xl font-bold mb-2">Progreso</h3>
              <p className="opacity-90">Seguimiento individualizado para que cada alumno avance a su ritmo.</p>
            </div>
            <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <span className="text-4xl mb-4 block">🤝</span>
              <h3 className="text-xl font-bold mb-2">Comunidad</h3>
              <p className="opacity-90">Más que un club, somos una familia que crece unida sobre ruedas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: CTA Final */}
      <section className="py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Preparado para rodar?</h2>
        <p className="text-gray-500 mb-10 max-w-xl mx-auto">
          Únete a nuestro club hoy mismo. El proceso de inscripción es totalmente online.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/register" 
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            Registrarme como Tutor
          </Link>
          <Link 
            href="/gallery" 
            className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition"
          >
            Ver Galería
          </Link>
        </div>
      </section>
    </div>
  )
}
