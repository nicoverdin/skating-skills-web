import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

export default async function Home() {
  const supabase = await createClient()

  // 1. Fetch images (Gallery)
  const { data: images } = await supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  // 2. Fetch active courses (NUEVO)
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true) // Solo mostramos los activos
    .order('start_date', { ascending: true })

  // 3. Fetch blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* HEADER / NAVIGATION */}
      <header className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-indigo-600">
              ⛸️ Club Patinaje
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#courses" className="text-gray-500 hover:text-indigo-600 transition">Cursos</a>
              <a href="#gallery" className="text-gray-500 hover:text-indigo-600 transition">Galería</a>
              <a href="#blog" className="text-gray-500 hover:text-indigo-600 transition">Noticias</a>
              <a href="#contact" className="text-gray-500 hover:text-indigo-600 transition">Contacto</a>
            </nav>
            <div>
              <Link 
                href="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
              >
                Área Privada
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 bg-gray-50 overflow-hidden">
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
                    <a href="#courses" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg transition">
                      Ver Cursos
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-indigo-100 flex items-center justify-center">
           <div className="text-indigo-300 font-bold text-6xl opacity-25">FOTO HERO</div>
        </div>
      </section>

      {/* COURSES SECTION (NUEVA SECCIÓN) */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Temporada 2026</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Oferta Formativa</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Grupos abiertos para inscripción. Encuentra tu nivel y horario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses?.length === 0 ? (
               <p className="col-span-full text-center text-gray-400 py-10">Próximamente abriremos nuevos cursos.</p>
            ) : (
              courses?.map((course) => (
                <div key={course.id} className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                      {course.description || 'Consulta los detalles en secretaría.'}
                    </p>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2 text-xl">⏱️</span>
                        <span className="font-semibold text-indigo-600">{course.hours_per_week} horas</span>
                        <span className="ml-1">/ semana</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                         <span className="mr-2 text-xl">📅</span>
                         <span>
                           {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
                         </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                         <span className="mr-2 text-xl">👥</span>
                         <span>Max. {course.capacity} alumnos</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <Link href="/login" className="block w-full text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-2 rounded-lg hover:bg-indigo-50 transition">
                      Inscribirse
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Comunidad</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Nuestra Galería</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {images?.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-10">No hay fotos disponibles aún.</p>
            ) : (
              images?.map((img) => (
                <div key={img.id} className="group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300">
                  <Image 
                    src={img.image_url} 
                    alt={img.title || 'Foto de patinaje'} 
                    fill 
                    unoptimized 
                    className="object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">{img.title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section id="blog" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Noticias</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Últimas Actualizaciones</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts?.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-10">Próximamente nuevas noticias.</p>
            ) : (
              posts?.map((post) => (
                <article key={post.id} className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition">
                  <div className="p-6 flex-1">
                    <div className="text-xs text-indigo-600 font-bold mb-2">
                      {new Date(post.published_at!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                  </div>
                  <div className="px-6 pb-6">
                    <Link href={`/blog/${post.slug}`} className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition">
                      Leer más &rarr;
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes dudas?</h2>
          <p className="mb-8 opacity-80">Estamos encantados de ayudarte a empezar tu camino en el patinaje.</p>
          <a href="mailto:info@clubpatinaje.com" className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
            Contactar con nosotros
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© 2026 Club Patinaje. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
