import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function RegisterPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    role: "trabajador",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      toast({
        title: "¡Registro exitoso!",
        description:
          "Usuario creado correctamente. " +
          (formData.role === "admin" ? "Acceso completo otorgado." : ""),
      });

      if (formData.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/worker/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error en registro",
        description: error.message || "No se pudo crear el usuario",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Registro de Usuarios</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ingrese su nombre completo"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="Ingrese su correo electrónico"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Input
            label="Teléfono"
            type="tel"
            placeholder="Ingrese su número de teléfono"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="trabajador">Trabajador</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <Input
            label="Contraseña"
            type="password"
            placeholder="Cree una contraseña segura"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            minLength={6}
            required
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Confirme su contraseña"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando usuario..." : "Registrar Usuario"}
          </Button>
        </form>
      </div>
    </div>
  );
}
