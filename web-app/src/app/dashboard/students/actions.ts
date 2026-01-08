'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createStudent(formData: FormData) {
  const supabase = await createClient()

  // Recogemos datos del formulario
  const rawData = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    date_of_birth: formData.get('date_of_birth') as string,
    skating_level: formData.get('skating_level') as string,
    guardian_id: formData.get('guardian_id') as string,
    medical_conditions: formData.get('medical_conditions') as string,
  }

  // Insertamos en la BD
  const { error } = await supabase
    .from('students')
    .insert(rawData)

  if (error) {
    console.error('Error creating student:', error)
    // En una app real, devolveríamos el error al formulario
    throw new Error('No se pudo crear el alumno')
  }

  // Refrescamos la lista de alumnos para que salga el nuevo
  revalidatePath('/dashboard/students')
  
  // Volvemos al listado
  redirect('/dashboard/students')
}
