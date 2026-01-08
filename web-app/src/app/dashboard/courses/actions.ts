'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCourse(formData: FormData) {
  const supabase = await createClient()

  // 1. Convertir datos numéricos
  const capacity = parseInt(formData.get('capacity') as string)
  const hoursPerWeek = parseFloat(formData.get('hours_per_week') as string)
  
  // 2. Gestionar coach_id (si viene vacío, enviamos null)
  const coachIdInput = formData.get('coach_id') as string
  const coachId = coachIdInput && coachIdInput !== '' ? coachIdInput : null

  // 3. Preparar objeto para la BD
  const data = {
    title: formData.get('title') as string,            // Antes era 'name'
    description: formData.get('description') as string,
    hours_per_week: isNaN(hoursPerWeek) ? 0 : hoursPerWeek,
    capacity: isNaN(capacity) ? 0 : capacity,
    start_date: formData.get('start_date') as string,  // Nuevo campo
    end_date: formData.get('end_date') as string,      // Nuevo campo
    coach_id: coachId,                                 // Nuevo campo (FK)
    is_active: formData.get('is_active') === 'on',     // Nuevo campo
    // Nota: 'level' y 'schedule' ya no existen en tu tabla SQL
  }

  const { error } = await supabase
    .from('courses')
    .insert(data)

  if (error) {
    console.error('Course error:', error)
    throw new Error('Error creando el curso')
  }

  revalidatePath('/dashboard/courses')
  redirect('/dashboard/courses')
}

export async function deleteCourse(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete error:', error)
    throw new Error('Error eliminando curso')
  }

  revalidatePath('/dashboard/courses')
}

// ... (imports existentes) ...

export async function updateCourse(formData: FormData) {
  const supabase = await createClient()
  
  // Recogemos los datos del formulario
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const coach_id = formData.get('coach_id') as string || null
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  
  // Conversiones numéricas y booleanas
  const hours_per_week = parseFloat(formData.get('hours_per_week') as string)
  const capacity = parseInt(formData.get('capacity') as string)
  // En HTML, si un checkbox no se marca, no se envía. Si se marca, envía "on".
  const is_active = formData.get('is_active') === 'on'

  const { error } = await supabase
    .from('courses')
    .update({
      title,
      description,
      coach_id,
      start_date,
      end_date,
      hours_per_week,
      capacity,
      is_active,
    })
    .eq('id', id)

  if (error) {
    console.error('Error actualizando curso:', error)
    throw new Error('No se pudo actualizar el curso')
  }

  revalidatePath('/dashboard/courses')
  redirect('/dashboard/courses')
}
