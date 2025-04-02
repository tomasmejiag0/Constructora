
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function useBudget() {
  const [budget, setBudget] = useState({ total: 0, expenses: [] })
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudget()
  }, [])

  const fetchBudget = async () => {
    try {
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: budgetData, error: budgetError } = await supabase
        .from('budget')
        .select('*')
        .single()

      if (expensesError) throw expensesError
      if (budgetError) throw budgetError

      setBudget({
        total: budgetData?.total || 0,
        expenses: expenses || []
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del presupuesto"
      })
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (expense) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expense,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      setBudget(prev => ({
        ...prev,
        expenses: [data[0], ...prev.expenses]
      }))
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo añadir el gasto"
      })
      throw error
    }
  }

  const updateExpense = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      setBudget(prev => ({
        ...prev,
        expenses: prev.expenses.map(expense => 
          expense.id === id ? data[0] : expense
        )
      }))
      return data[0]
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el gasto"
      })
      throw error
    }
  }

  const deleteExpense = async (id) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      setBudget(prev => ({
        ...prev,
        expenses: prev.expenses.filter(expense => expense.id !== id)
      }))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el gasto"
      })
      throw error
    }
  }

  const setTotalBudget = async (total) => {
    try {
      const { data, error } = await supabase
        .from('budget')
        .upsert({ id: 1, total })
        .select()

      if (error) throw error
      setBudget(prev => ({ ...prev, total }))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el presupuesto total"
      })
      throw error
    }
  }

  return { 
    budget, 
    addExpense, 
    updateExpense, 
    deleteExpense,
    setTotalBudget,
    loading
  }
}
