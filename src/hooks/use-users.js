import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export function useUsers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createUser = async (userData) => {
    try {
      setLoading(true);
      
      // 1. Registro en Auth + Perfil automático (via trigger)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { // Metadata que usará el trigger
            username: userData.username,
            full_name: userData.name,
            role: userData.role,
            phone_number: userData.phone
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;

      toast({
        title: "¡Usuario creado!",
        description: `Se ha registrado ${userData.email}`,
      });

      return authData.user;

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading };
}