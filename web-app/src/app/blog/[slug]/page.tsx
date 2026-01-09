import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown' // Importamos el procesador

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await Promise.resolve(params)
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!post) notFound()

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-500 text-sm gap-2">
           <time>{new Date(post.published_at || post.created_at).toLocaleDateString('es-ES', {
             day: 'numeric', month: 'long', year: 'numeric'
           })}</time>
        </div>
      </header>
      
      {post.cover_image_url && (
        <img src={post.cover_image_url} className="w-full rounded-3xl mb-12 shadow-xl border border-gray-100" alt={post.title} />
      )}
      
      {/* RENDERIZADO DE MARKDOWN */}
      <div className="prose prose-indigo lg:prose-xl max-w-none">
        <ReactMarkdown 
          components={{
            // Personalizamos cómo se ven algunos elementos si queremos
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc ml-6 space-y-2" {...props} />,
            p: ({node, ...props}) => <p className="leading-relaxed text-gray-700 mb-4" {...props} />,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
