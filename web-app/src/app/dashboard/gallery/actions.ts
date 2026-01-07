'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function uploadImage(formData: FormData) {
  const supabase = await createClient()

  // 1. Extract Data
  const title = formData.get('title') as string
  const file = formData.get('image') as File

  if (!file || file.size === 0) {
    throw new Error('Debes seleccionar una imagen')
  }

  // 2. Upload File to Storage Bucket
  // Create a unique filename: timestamp-originalName
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw new Error('Error subiendo la imagen al bucket')
  }

  // 3. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('gallery')
    .getPublicUrl(filePath)

  // 4. Save Reference in Database
  const { error: dbError } = await supabase
    .from('gallery_images')
    .insert({
      title,
      image_url: publicUrl,
      category: 'general' // Default category
    })

  if (dbError) {
    console.error('DB error:', dbError)
    throw new Error('Error guardando en base de datos')
  }

  revalidatePath('/dashboard/gallery')
  revalidatePath('/') // Revalidate home so the image appears there too
}

export async function deleteImage(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  // Note: To delete correctly from Storage, we would need to store the "path" in DB too.
  // For this MVP, we will only delete the database reference. 
  // (In a real production app, you should delete the file from the bucket too using .remove())

  const { error } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting:', error)
  }

  revalidatePath('/dashboard/gallery')
  revalidatePath('/')
}