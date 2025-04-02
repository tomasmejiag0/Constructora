
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
import { useAuth } from "@/hooks/use-auth"
import { useBudget } from "@/hooks/use-budget"
import { formatCurrency } from "@/lib/utils"

export function TaskDialog({ open, onOpenChange, onSubmit, task }) {
  const isEditing = Boolean(task?.id)
  const { budget } = useBudget()
  
  // Lista de trabajadores disponibles
  const workers = [
    { id: 4, name: "Juan Pérez", position: "Albañil" },
    { id: 5, name: "María García", position: "Electricista" },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const budgetPercentage = Number(formData.get("budgetPercentage"))
    const budgetAmount = (budget.total * budgetPercentage) / 100

    onSubmit({
      title: formData.get("title"),
      description: formData.get("description"),
      assignedTo: formData.get("assignedTo"),
      dueDate: formData.get("dueDate"),
      status: formData.get("status"),
      priority: formData.get("priority"),
      budgetPercentage,
      budgetAmount,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tarea" : "Nueva Tarea"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                defaultValue={task?.title || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                defaultValue={task?.description || ""}
              />
            </div>
            <div>
              <Label htmlFor="assignedTo">Asignado a</Label>
              <select
                id="assignedTo"
                name="assignedTo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={task?.assignedTo || ""}
                required
              >
                <option value="">Seleccionar trabajador</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.name}>
                    {worker.name} - {worker.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="budgetPercentage">Porcentaje del Presupuesto Total ({formatCurrency(budget.total)})</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="budgetPercentage"
                  name="budgetPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue={task?.budgetPercentage || "0"}
                  required
                />
                <span>%</span>
              </div>
              {task?.budgetPercentage && (
                <p className="text-sm text-muted-foreground mt-1">
                  Presupuesto asignado: {formatCurrency(task.budgetAmount)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                name="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={task?.status || "pendiente"}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <select
                id="priority"
                name="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={task?.priority || "media"}
                required
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dueDate">Fecha límite</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={task?.dueDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
