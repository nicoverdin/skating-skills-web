'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrollStudent(formData: FormData) {
  const supabase = await createClient()

  const student_id = formData.get('student_id') as string
  const course_id = formData.get('course_id') as string

  // LOG DE DEBUG
  console.log("📥 INSCRIPCIÓN: Iniciando...", { student_id, course_id })

  if (!course_id || !student_id) {
    console.error("❌ ERROR: Faltan IDs")
    return
  }

  const { error } = await supabase
    .from('enrollments')
    .insert({ student_id, course_id })

  if (error) {
    console.error('❌ ERROR SUPABASE (Insert):', error.message)
    // Lanzamos error para verlo en pantalla si es necesario
    throw new Error(error.message) 
  } else {
    console.log("✅ INSCRIPCIÓN: Éxito")
  }

  // Actualizamos ambas pantallas
  revalidatePath(`/dashboard/students/${student_id}`)
  revalidatePath('/dashboard')
}

export async function unenrollStudent(formData: FormData) {
  const supabase = await createClient()

  const enrollment_id = formData.get('enrollment_id') as string
  const student_id = formData.get('student_id') as string

  // LOG DE DEBUG
  console.log("🗑️ DESINSCRIPCIÓN: Iniciando...")
  console.log("--> Enrollment ID:", enrollment_id)
  console.log("--> Student ID:", student_id)

  if (!enrollment_id) {
    console.error("❌ ERROR: No ha llegado el enrollment_id")
    return
  }

  const { error, count } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', enrollment_id)
    .select('*', { count: 'exact' }) // Pedimos confirmación de cuántos borró

  if (error) {
    console.error('❌ ERROR SUPABASE (Delete):', error.message)
    throw new Error(error.message)
  }

  // Verificamos si realmente borró algo
  if (count === 0) {
    console.warn("⚠️ ALERTA: La base de datos dice que borró 0 filas. ¿Quizás el ID no existía?")
  } else {
    console.log(`✅ DESINSCRIPCIÓN: Éxito. Borradas ${count} filas.`)
  }

  revalidatePath(`/dashboard/students/${student_id}`)
  revalidatePath('/dashboard')
}
