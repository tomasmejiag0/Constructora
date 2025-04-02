
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useAttendance() {
  const [attendance, setAttendance] = useState([])
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAttendance(data || [])
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

  const registerEntry = async (employeeId) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          employee_id: employeeId,
          type: 'entry',
          timestamp: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      setAttendance([data[0], ...attendance])
      return true
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la entrada"
      })
      return false
    }
  }

  const registerExit = async (employeeId) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          employee_id: employeeId,
          type: 'exit',
          timestamp: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      setAttendance([data[0], ...attendance])
      return true
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la salida"
      })
      return false
    }
  }

  const getAttendanceByDate = (date) => {
    return attendance.filter(record => 
      record.timestamp.startsWith(date)
    )
  }

  const getAttendanceByEmployee = (employeeId) => {
    return attendance.filter(record => 
      record.employee_id === employeeId
    )
  }

  const getAttendanceStats = (date) => {
    const records = getAttendanceByDate(date)
    const uniqueEmployees = [...new Set(records.map(r => r.employee_id))]
    
    return {
      total: uniqueEmployees.length,
      present: uniqueEmployees.length,
      absent: 0,
      late: 0
    }
  }

  return { 
    attendance, 
    registerEntry, 
    registerExit,
    getAttendanceByDate,
    getAttendanceByEmployee,
    getAttendanceStats,
    loading
  }
}
