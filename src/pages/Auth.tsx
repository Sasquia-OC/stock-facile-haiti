import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Globe, Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import logoBiznisPam from "@/assets/logo-biznis-pam.webp";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t, settings, setLanguage } = useSettings();

  const toggleLang = () => setLanguage(settings.language === "fr" ? "ht" : "fr");

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-start pt-16 px-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-destructive/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-success/5 blur-3xl animate-[pulse_7s_ease-in-out_infinite_2s]" />
      </div>

      {/* Sélecteur de langue */}
      <button
        onClick={toggleLang}
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-border bg-card/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-accent hover:scale-105 transition-all duration-200"
        type="button"
      >
        <Globe className="h-3.5 w-3.5" />
        {settings.language === "fr" ? "Kreyòl" : "Français"}
      </button>

      {/* Logo + titre — compact */}
      <div className="flex flex-col items-center gap-3 mb-4 relative z-10 animate-fade-in">
        <div
          className="rounded-xl bg-white/95 p-2 shadow-lg animate-scale-in"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          <img src={logoBiznisPam} alt="Ayiti Biznis" className="h-12 w-12 object-contain" />
        </div>
        <h2
          className="text-lg font-bold tracking-tight animate-fade-in"
          style={{ animationDelay: "0.3s", animationFillMode: "both" }}
        >
          {t("auth_page_title")}
        </h2>
        <p
          className="text-xs text-muted-foreground animate-fade-in text-center max-w-xs"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          {t("auth_welcome_desc")}
        </p>
      </div>


      {/* Card principale — avec animation d'entrée décalée */}
      <Card
        className="w-full max-w-sm border-border/50 shadow-lg backdrop-blur-sm bg-card/95 animate-fade-in relative z-10"
        style={{ animationDelay: "0.15s", animationFillMode: "both" }}
      >
        <CardHeader className="text-center space-y-1 pt-6 pb-3">
          <CardTitle className="text-lg font-semibold">
            {isLogin ? t("auth_login_title") : t("auth_signup_title")}
          </CardTitle>
          <CardDescription className="text-sm">
            {isLogin ? t("auth_login_desc") : t("auth_signup_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 hover:scale-[1.02] transition-all duration-200 hover:shadow-md"
              disabled={loading}
              onClick={() => handleOAuth("google")}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm">Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 hover:scale-[1.02] transition-all duration-200 hover:shadow-md"
              disabled={loading}
              onClick={() => handleOAuth("apple")}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-sm">Apple</span>
            </Button>
          </div>

          {/* Séparateur animé */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">
                {settings.language === "fr" ? "ou par email" : "oswa pa imèl"}
              </span>
            </div>
          </div>

          {/* Formulaire email/mot de passe */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={t("auth_email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 transition-all duration-200 focus:shadow-md"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder={t("auth_password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 transition-all duration-200 focus:shadow-md"
              />
            </div>
            <Button
              type="submit"
              className="w-full group hover:shadow-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? t("auth_login_btn") : t("auth_signup_btn")}
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline underline-offset-4 transition-colors duration-200"
            >
              {isLogin ? t("auth_no_account") : t("auth_has_account")}
            </button>
          </div>
        </CardContent>
      </Card>

      <footer
        className="mt-8 text-center text-xs text-muted-foreground animate-fade-in relative z-10"
        style={{ animationDelay: "0.5s", animationFillMode: "both" }}
      >
        © {new Date().getFullYear()} Creovate. Tous droits réservés.
      </footer>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
