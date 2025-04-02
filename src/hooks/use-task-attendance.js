
import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useTaskAttendance() {
  const [taskAttendance, setTaskAttendance] = useState([])
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTaskAttendance()
  }, [])

  const fetchTaskAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('task_attendance')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTaskAttendance(data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la asistencia"
      })
    } finally {
      setLoading(false)
    }
  }

  const registerTaskAttendance = async (taskId, employeeId, type, notes = '') => {
    try {
      const { data, error } = await supabase
        .from('task_attendance')
        .insert([{
          task_id: taskId,
          employee_id: employeeId,
          type,
          notes,
          timestamp: new Date().toISOString(),
          status: type === 'start' ? 'en_progreso' : 'completado'
        }])
        .select()

      if (error) throw error
      setTaskAttendance([...taskAttendance, data[0]])
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la asistencia"
      })
      throw error
    }
  }

  const updateTaskAttendance = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('task_attendance')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      setTaskAttendance(taskAttendance.map(record =>
        record.id === id ? data[0] : record
      ))
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la asistencia"
      })
      throw error
    }
  }

  const getTaskAttendance = (taskId) => {
    return taskAttendance.filter(record => record.task_id === taskId)
  }

  const getEmployeeTaskAttendance = (employeeId) => {
    return taskAttendance.filter(record => record.employee_id === employeeId)
  }

  return {
    taskAttendance,
    registerTaskAttendance,
    updateTaskAttendance,
    getTaskAttendance,
    getEmployeeTaskAttendance,
    loading
  }
}
