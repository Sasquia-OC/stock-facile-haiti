import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import logoBiznisPam from "@/assets/logo-biznis-pam.png";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t, settings, setLanguage } = useSettings();

  const toggleLang = () => setLanguage(settings.language === "fr" ? "ht" : "fr");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({
          title: t("auth_signup_success"),
          description: t("auth_signup_check_email"),
        });
      }
    } catch (error: any) {
      toast({
        title: t("auth_error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative">
      {/* Sélecteur de langue */}
      <button
        onClick={toggleLang}
        className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-accent transition-colors"
        type="button"
      >
        <Globe className="h-3.5 w-3.5" />
        {settings.language === "fr" ? "Kreyòl" : "Français"}
      </button>

      {/* Bannière de bienvenue */}
      <div className="w-full max-w-sm mb-6 rounded-2xl overflow-hidden shadow-lg">
        <div className="relative bg-gradient-to-r from-[hsl(216,100%,29%)] via-[hsl(216,100%,22%)] to-[hsl(352,80%,45%)] p-6 text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_70%)]" />
          <div className="relative z-10 space-y-2">
            <div className="mx-auto w-fit rounded-xl bg-white/95 p-2.5 shadow-md">
              <img src={logoBiznisPam} alt="Ayiti Biznis" className="h-12 w-12 object-contain" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t("auth_welcome_title")}
            </h2>
            <p className="text-sm text-white/80">
              {t("auth_welcome_desc")}
            </p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1 pt-5 pb-3">
          <CardTitle className="text-lg">
            {isLogin ? t("auth_login_title") : t("auth_signup_title")}
          </CardTitle>
          <CardDescription>
            {isLogin ? t("auth_login_desc") : t("auth_signup_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder={t("auth_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder={t("auth_password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? t("auth_login_btn") : t("auth_signup_btn")}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? t("auth_no_account") : t("auth_has_account")}
            </button>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Creovate. Tous droits réservés.
      </footer>
    </div>
  );
}
