
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTaskAttendance } from "@/hooks/use-task-attendance"
import { useToast } from "@/components/ui/use-toast"

export function TaskAttendanceDialog({ open, onOpenChange, task, employeeId }) {
  const { registerTaskAttendance } = useTaskAttendance()
  const { toast } = useToast()

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      registerTaskAttendance(
        task.id,
        employeeId,
        formData.get("type"),
        formData.get("notes")
      )
      
      toast({
        title: "Asistencia registrada",
        description: "Se ha registrado la asistencia correctamente",
      })
      
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la asistencia",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Asistencia - {task.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Tipo de Registro</Label>
              <select
                id="type"
                name="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="start">Inicio de Trabajo</option>
                <option value="pause">Pausa</option>
                <option value="resume">Reanudar</option>
                <option value="complete">Completar</option>
              </select>
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                name="notes"
                type="text"
                placeholder="Agregar notas o comentarios"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
