import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type AppRole = "owner" | "employee";

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>("employee");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole("employee");
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setRole(data.role as AppRole);
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const isOwner = role === "owner";
  const isEmployee = role === "employee";

  return { role, isOwner, isEmployee, loading };
}
