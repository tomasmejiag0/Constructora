
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { TaskAttendanceDialog } from "./task-attendance-dialog"
import { useTaskAttendance } from "@/hooks/use-task-attendance"
import { Clock, PlayCircle, PauseCircle, CheckCircle } from "lucide-react"

export function TaskAttendanceButton({ task, employeeId }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { taskAttendance, loading } = useTaskAttendance()

  const lastAttendance = taskAttendance
    .filter(record => record.task_id === task.id && record.employee_id === employeeId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]

  const isWorking = lastAttendance?.type === "start" || lastAttendance?.type === "resume"
  const isCompleted = lastAttendance?.type === "complete"

  const getButtonProps = () => {
    if (isCompleted) {
      return {
        variant: "secondary",
        icon: CheckCircle,
        text: "Tarea Completada",
        disabled: true
      }
    }
    if (isWorking) {
      return {
        variant: "destructive",
        icon: PauseCircle,
        text: "Registrar Pausa/Fin"
      }
    }
    return {
      variant: "default",
      icon: PlayCircle,
      text: "Iniciar Trabajo"
    }
  }

  const buttonProps = getButtonProps()

  return (
    <>
      <Button
        variant={buttonProps.variant}
        size="sm"
        className="w-full mt-2"
        onClick={() => setDialogOpen(true)}
        disabled={loading || buttonProps.disabled}
      >
        <buttonProps.icon className="mr-2 h-4 w-4" />
        {buttonProps.text}
      </Button>

      <TaskAttendanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={task}
        employeeId={employeeId}
        currentStatus={isWorking ? "working" : "idle"}
      />
    </>
  )
}
