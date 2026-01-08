import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updatePost } from '../actions'
import Link from 'next/link'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params)
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  // Bind the ID to the update action
  const updatePostWithId = updatePost.bind(null, post.id)

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Noticia</h1>
        <Link href="/dashboard/blog" className="text-gray-500">Cancelar</Link>
      </div>

      <form action={updatePostWithId} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input 
              name="title" 
              required 
              type="text" 
              defaultValue={post.title}
              className="mt-1 block w-full border rounded-md p-2 text-lg font-bold"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Resumen corto (Excerpt)</label>
            <textarea 
              name="excerpt" 
              rows={2} 
              defaultValue={post.excerpt || ''}
              className="mt-1 block w-full border rounded-md p-2 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Contenido</label>
            <textarea 
              name="content" 
              required 
              rows={10} 
              defaultValue={post.content || ''}
              className="mt-1 block w-full border rounded-md p-2 font-mono text-sm"
            />
          </div>

          <div className="flex items-center">
            <input 
              id="is_published" 
              name="is_published" 
              type="checkbox" 
              defaultChecked={post.is_published || false}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
              Publicar inmediatamente
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white py-3 rounded-md font-bold hover:bg-indigo-700 transition"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  )
}
