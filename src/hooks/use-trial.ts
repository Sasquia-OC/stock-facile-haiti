import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface TrialInfo {
  planType: string;
  status: string;
  daysRemaining: number;
  isExpired: boolean;
  isWarning: boolean; // <= 15 days
  isCritical: boolean; // <= 3 days
  loading: boolean;
}

export function useTrial(): TrialInfo {
  const { user } = useAuth();
  const [trial, setTrial] = useState<TrialInfo>({
    planType: "Essai Gratuit",
    status: "active_trial",
    daysRemaining: 90,
    isExpired: false,
    isWarning: false,
    isCritical: false,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setTrial((t) => ({ ...t, loading: false }));
      return;
    }

    const fetchProfile = async () => {
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Auto-create profile for existing users who don't have one
      if (!data && !error) {
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({ user_id: user.id })
          .select()
          .single();
        data = newProfile;
      }

      if (!data) {
        setTrial((t) => ({ ...t, loading: false }));
        return;
      }

      const now = new Date();
      const endDate = new Date(data.end_date);
      const diffMs = endDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const isExpired = daysRemaining === 0 || data.status === "expired";

      // Auto-expire if needed
      if (isExpired && data.status !== "expired") {
        await supabase
          .from("profiles")
          .update({ status: "expired" })
          .eq("user_id", user.id);
      }

      setTrial({
        planType: data.plan_type,
        status: isExpired ? "expired" : data.status,
        daysRemaining,
        isExpired,
        isWarning: !isExpired && daysRemaining <= 15,
        isCritical: !isExpired && daysRemaining <= 3,
        loading: false,
      });
    };

    fetchProfile();
  }, [user]);

  return trial;
}
