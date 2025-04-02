
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useUsers() {
  const [users, setUsers] = useState([])
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los usuarios"
      })
    } finally {
      setLoading(false)
    }
  }

  const addUser = async (userData) => {
    try {
      // Primero creamos el usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (authError) throw authError

      // Luego guardamos los datos adicionales en la tabla users
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          username: userData.username,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      setUsers([data[0], ...users])
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el usuario"
      })
      throw error
    }
  }

  const updateUser = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      setUsers(users.map(user => user.id === id ? data[0] : user))
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el usuario"
      })
      throw error
    }
  }

  const deleteUser = async (id) => {
    try {
      // Primero eliminamos el usuario de auth
      const { error: authError } = await supabase.auth.admin.deleteUser(id)
      if (authError) throw authError

      // Luego eliminamos los datos de la tabla users
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error
      setUsers(users.filter(user => user.id !== id))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario"
      })
      throw error
    }
  }

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    loading
  }
}
