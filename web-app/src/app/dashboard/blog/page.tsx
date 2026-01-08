import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deletePost } from './actions'

export default async function BlogDashboard() {
  const supabase = await createClient()

  // Fetch all posts (published and drafts)
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión del Blog</h1>
        <Link 
          href="/dashboard/blog/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Nueva Noticia
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {posts?.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">No hay noticias creadas.</li>
          ) : (
            posts?.map((post) => (
              <li key={post.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-indigo-600 truncate">{post.title}</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.is_published ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 truncate">{post.excerpt}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Link 
                    href={`/dashboard/blog/${post.id}`} 
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    Editar
                  </Link>
                  
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button 
                      type="submit" 
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
