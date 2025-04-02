
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useInventory() {
  const [inventory, setInventory] = useState([])
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInventory(data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el inventario"
      })
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (item) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          ...item,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      setInventory([data[0], ...inventory])
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo añadir el material"
      })
      throw error
    }
  }

  const updateItem = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      setInventory(inventory.map(item => item.id === id ? data[0] : item))
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el material"
      })
      throw error
    }
  }

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id)

      if (error) throw error
      setInventory(inventory.filter(item => item.id !== id))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el material"
      })
      throw error
    }
  }

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.minStock)
  }

  const getItemsByCategory = (category) => {
    return inventory.filter(item => item.category === category)
  }

  return {
    inventory,
    addItem,
    updateItem,
    deleteItem,
    getLowStockItems,
    getItemsByCategory,
    loading
  }
}
