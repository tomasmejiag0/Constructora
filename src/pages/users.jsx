import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserDialog } from "@/components/users/user-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Obtener usuarios de Supabase
  useEffect(() => {
    if (currentUser?.role === "SuperAdmin") {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles') // Cambia 'profiles' por el nombre de tu tabla de usuarios
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.role !== "SuperAdmin") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">
          Acceso Denegado
        </h1>
        <p className="mt-2">
          No tienes permisos para acceder a esta página.
        </p>
      </div>
    );
  }

  const handleSubmit = async (userData) => {
    try {
      if (selectedUser) {
        // Actualizar usuario existente
        const { data, error } = await supabase
          .from('profiles')
          .update(userData)
          .eq('id', selectedUser.id)
          .select();

        if (error) throw error;

        toast({
          title: "Usuario actualizado",
          description: "El usuario se ha actualizado correctamente",
        });
      } else {
        // Crear nuevo usuario
        const { data, error } = await supabase
          .from('profiles')
          .insert([userData])
          .select();

        if (error) throw error;

        toast({
          title: "Usuario creado",
          description: "El usuario se ha creado correctamente",
        });
      }
      setDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(); // Refrescar la lista de usuarios
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el usuario",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado correctamente",
      });
      fetchUsers(); // Refrescar la lista de usuarios
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => setDialogOpen(true)}>
          Nuevo Usuario
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                {user.first_name} {user.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Email: {user.email}</p>
                <p className="text-sm">Rol: {user.role}</p>
                {user.phone && <p className="text-sm">Teléfono: {user.phone}</p>}
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedUser(null);
        }}
        onSubmit={handleSubmit}
        user={selectedUser}
      />
    </div>
  );
}