'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 1. UPDATE STUDENT
export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    date_of_birth: formData.get('date_of_birth') as string,
    skating_level: formData.get('skating_level') as string,
    guardian_id: formData.get('guardian_id') as string,
    medical_conditions: formData.get('medical_conditions') as string,
  }

  const { error } = await supabase
    .from('students')
    .update(rawData)
    .eq('id', id)

  if (error) {
    console.error('Error updating student:', error)
    throw new Error('Error al actualizar')
  }

  revalidatePath('/dashboard/students')
  redirect('/dashboard/students')
}

// 2. DELETE STUDENT
export async function deleteStudent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting student:', error)
    throw new Error('Error al eliminar')
  }

  revalidatePath('/dashboard/students')
  redirect('/dashboard/students')
}