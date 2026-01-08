import { createPost } from '../actions'
import Link from 'next/link'

export default function NewPostPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nueva Noticia / Post</h1>
        <Link href="/dashboard/blog" className="text-gray-500">Cancelar</Link>
      </div>

      <form action={createPost} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Título de la noticia</label>
            <input 
              name="title" 
              required 
              type="text" 
              className="mt-1 block w-full border rounded-md p-2 text-lg font-bold"
              placeholder="Ej: Resultados del Trofeo de Invierno"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Resumen corto (Excerpt)</label>
            <textarea 
              name="excerpt" 
              rows={2} 
              className="mt-1 block w-full border rounded-md p-2 text-sm"
              placeholder="Una breve descripción que aparecerá en la portada..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Contenido del artículo</label>
            <textarea 
              name="content" 
              required 
              rows={10} 
              className="mt-1 block w-full border rounded-md p-2 font-mono text-sm"
              placeholder="Escribe aquí el cuerpo de la noticia... (Acepta texto plano por ahora)"
            />
          </div>

          <div className="flex items-center">
            <input 
              id="is_published" 
              name="is_published" 
              type="checkbox" 
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
              Publicar inmediatamente (visible para todos)
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white py-3 rounded-md font-bold hover:bg-indigo-700 transition"
        >
          Guardar Noticia
        </button>
      </form>
    </div>
  )
}
