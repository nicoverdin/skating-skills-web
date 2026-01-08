'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Helper to create URL-friendly slugs
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
}

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const is_published = formData.get('is_published') === 'on'

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('posts')
    .insert({
      title,
      slug: `${slugify(title)}-${Date.now().toString().slice(-4)}`, // Unique slug
      content,
      excerpt,
      is_published,
      author_id: user?.id,
      published_at: is_published ? new Date().toISOString() : null
    })

  if (error) {
    console.error('Blog error:', error)
    throw new Error('Error al crear la noticia')
  }

  revalidatePath('/dashboard/blog')
  revalidatePath('/')
  redirect('/dashboard/blog')
}
