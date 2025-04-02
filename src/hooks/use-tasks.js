
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las tareas"
      })
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (task) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          created_at: new Date().toISOString(),
          status: task.status || "pendiente",
          priority: task.priority || "media"
        }])
        .select()

      if (error) throw error
      setTasks([...tasks, data[0]])
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la tarea"
      })
      throw error
    }
  }

  const updateTask = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      setTasks(tasks.map(task => task.id === id ? data[0] : task))
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la tarea"
      })
      throw error
    }
  }

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTasks(tasks.filter(task => task.id !== id))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la tarea"
      })
      throw error
    }
  }

  const getTasksByWorker = (workerName) => {
    return tasks.filter(task => task.assignedTo === workerName)
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const getTasksByPriority = (priority) => {
    return tasks.filter(task => task.priority === priority)
  }

  return { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask,
    getTasksByWorker,
    getTasksByStatus,
    getTasksByPriority,
    loading
  }
}
