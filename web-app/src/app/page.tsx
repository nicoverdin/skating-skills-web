import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

export default async function Home() {
  const supabase = await createClient()
  const { data: images } = await supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER / NAVIGATION */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-indigo-600">
              ⛸️ Club Patinaje
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#gallery" className="text-gray-500 hover:text-gray-900">Galería</a>
              <a href="#blog" className="text-gray-500 hover:text-gray-900">Noticias</a>
              <a href="#contact" className="text-gray-500 hover:text-gray-900">Contacto</a>
            </nav>
            <div>
              <Link 
                href="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Área Privada
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="relative bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Pasión sobre</span>{' '}
                  <span className="block text-indigo-600 xl:inline">ruedas</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Formamos patinadores desde la iniciación hasta la alta competición. 
                  Únete a nuestra familia y descubre el deporte que nos mueve.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a href="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg">
                      Inscribirse
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        {/* Placeholder image for Hero */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-indigo-100 flex items-center justify-center">
           <div className="text-indigo-300 font-bold text-6xl opacity-25">FOTO HERO</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {images?.map((img) => (
          <div key={img.id} className="relative h-64 rounded-lg overflow-hidden shadow-lg">
            <Image 
              src={img.image_url} 
              alt={img.title || ''} 
              fill 
              unoptimized 
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
              {img.title}
            </div>
          </div>
        ))}
      </div>

       {/* FOOTER */}
       <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>© 2026 Club Patinaje. Todos los derechos reservados.</p>
          </div>
       </footer>
    </div>
  )
}