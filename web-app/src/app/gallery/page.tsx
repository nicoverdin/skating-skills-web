import { createClient } from '@/lib/supabase/server'

export default async function GalleryPage() {
  const supabase = await createClient()
  
  // Traemos las fotos (las más recientes primero)
  const { data: images } = await supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Nuestra Galería</h1>
          <p className="mt-4 text-gray-600">Momentos inolvidables de nuestros patinadores.</p>
        </div>

        {images && images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <div key={img.id} className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-square">
                <img
                  src={img.image_url}
                  alt={img.title || 'Foto de la galería'}
                  className="object-cover w-full h-full transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <p className="text-white font-medium">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">Aún no hay fotos en la galería. ¡Vuelve pronto!</p>
          </div>
        )}
      </div>
    </div>
  )
}
