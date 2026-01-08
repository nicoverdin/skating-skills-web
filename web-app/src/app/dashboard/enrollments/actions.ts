'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrollStudent(formData: FormData) {
  const supabase = await createClient()

  const student_id = formData.get('student_id') as string
  const course_id = formData.get('course_id') as string

  if (!course_id || !student_id) return

  const { error } = await supabase
    .from('enrollments')
    .insert({ student_id, course_id })

  if (error) {
    // Si viola la restricción UNIQUE (ya está inscrito), lo ignoramos o lanzamos error
    console.error('Error inscribiendo:', error)
  }

  revalidatePath(`/dashboard/students/${student_id}`)
}

export async function unenrollStudent(formData: FormData) {
  const supabase = await createClient()

  const enrollment_id = formData.get('enrollment_id') as string
  const student_id = formData.get('student_id') as string // Para revalidar la ruta correcta

  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', enrollment_id)

  if (error) {
    console.error('Error desinscribiendo:', error)
  }

  revalidatePath(`/dashboard/students/${student_id}`)
}
