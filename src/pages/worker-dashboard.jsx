
import React from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { useAttendance } from "@/hooks/use-attendance"
import { useTasks } from "@/hooks/use-tasks"
import { useTaskAttendance } from "@/hooks/use-task-attendance"
import { formatDate } from "@/lib/utils"
import { TaskAttendanceButton } from "@/components/tasks/task-attendance-button"
import Dashboard from "./dashboard"

export function WorkerDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const { attendance, registerEntry, registerExit } = useAttendance()
  const { tasks } = useTasks()
  const { taskAttendance } = useTaskAttendance()

  if (!user) return null

  const todayAttendance = attendance.filter(
    a => a.employeeId === user.id && 
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  )

  const hasEntryToday = todayAttendance.some(a => a.type === "entry")
  const hasExitToday = todayAttendance.some(a => a.type === "exit")

  const handleEntry = () => {
    try {
      registerEntry(user.id)
      toast({
        title: "Entrada registrada",
        description: "Se ha registrado tu entrada correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la entrada",
      })
    }
  }

  const handleExit = () => {
    try {
      registerExit(user.id)
      toast({
        title: "Salida registrada",
        description: "Se ha registrado tu salida correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la salida",
      })
    }
  }

  const myTasks = tasks.filter(task => task.assignedTo === user.name)
  const urgentTasks = myTasks.filter(task => task.priority === "urgente")
  const pendingTasks = myTasks.filter(task => task.status === "pendiente")
  const inProgressTasks = myTasks.filter(task => task.status === "en_progreso")

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenido, {user.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {user.position} - Proyecto #{user.projectId}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Registro de Asistencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Registro de Asistencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  onClick={handleEntry}
                  disabled={hasEntryToday}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Registrar Entrada
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleExit}
                  disabled={!hasEntryToday || hasExitToday}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Registrar Salida
                </Button>
              </div>
              {todayAttendance.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Registros de hoy:</h3>
                  {todayAttendance.map((record, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {record.type === "entry" ? "Entrada" : "Salida"}: {
                        new Date(record.timestamp).toLocaleTimeString()
                      }
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen de Tareas */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-lg font-semibold text-yellow-700">{urgentTasks.length}</p>
                  <p className="text-sm text-yellow-600">Tareas Urgentes</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-semibold text-blue-700">{pendingTasks.length}</p>
                  <p className="text-sm text-blue-600">Tareas Pendientes</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-lg font-semibold text-green-700">{inProgressTasks.length}</p>
                  <p className="text-sm text-green-600">En Progreso</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-lg font-semibold text-purple-700">{myTasks.length}</p>
                  <p className="text-sm text-purple-600">Total Tareas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Tareas */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Mis Tareas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTasks.length === 0 ? (
              <p className="text-sm text-gray-500 col-span-full">
                No tienes tareas asignadas actualmente.
              </p>
            ) : (
              myTasks.map((task) => (
                <Card key={task.id} className={
                  task.priority === "urgente" ? "border-red-500" :
                  task.priority === "alta" ? "border-orange-500" :
                  task.priority === "media" ? "border-yellow-500" :
                  "border-green-500"
                }>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      {task.priority === "urgente" && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Estado: {task.status}</span>
                        <span>Fecha límite: {formatDate(task.dueDate)}</span>
                      </div>
                      <TaskAttendanceButton task={task} employeeId={user.id} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}


export default WorkerDashboard;