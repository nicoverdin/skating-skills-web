import { createClient } from '@/lib/supabase/server'
import { uploadImage, deleteImage } from './actions'
import Image from 'next/image'

export default async function GalleryDashboard() {
  const supabase = await createClient()

  // Fetch existing images
  const { data: images } = await supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Gestión de Galería</h1>

      {/* UPLOAD FORM */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-10">
        <h2 className="text-lg font-semibold mb-4">Subir Nueva Foto</h2>
        <form action={uploadImage} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input 
              type="text" 
              name="title" 
              required 
              placeholder="Ej. Competición Regional" 
              className="w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*"
              required 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Subir Foto
          </button>
        </form>
      </div>

      {/* IMAGE GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images?.map((img) => (
          <div key={img.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-w-16 aspect-h-9 relative h-48 bg-gray-100">
              {/* Next/Image requires width/height or layout fill */}
              <Image 
                src={img.image_url} 
                alt={img.title || 'Foto galería'} 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 truncate">{img.title}</p>
              
              {/* DELETE BUTTON */}
              <form action={deleteImage} className="mt-2">
                <input type="hidden" name="id" value={img.id} />
                <button 
                  type="submit"
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {images?.length === 0 && (
        <p className="text-center text-gray-500 py-10">No hay imágenes subidas todavía.</p>
      )}
    </div>
  )
}