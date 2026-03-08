import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoBiznisPam from "@/assets/logo-biznis-pam.png";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Bannière de bienvenue */}
      <div className="w-full max-w-sm mb-6 rounded-2xl overflow-hidden shadow-lg">
        <div className="relative bg-gradient-to-r from-[hsl(216,100%,29%)] via-[hsl(216,100%,22%)] to-[hsl(352,80%,45%)] p-6 text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_70%)]" />
          <div className="relative z-10 space-y-2">
            <div className="mx-auto w-fit rounded-xl bg-white/95 p-2.5 shadow-md">
              <img src={logoBiznisPam} alt="Ayiti Biznis" className="h-12 w-12 object-contain" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Byenveni sou Ayiti Biznis!
            </h2>
            <p className="text-sm text-white/80">
              Jere biznis ou pi byen — stòk, vant ak benefis.
            </p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1 pt-5 pb-3">
          <CardTitle className="text-lg">
            {isLogin ? "Konekte ou" : "Kreye kont ou"}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Antre email ak modpas ou" : "Enskri gratis pou kòmanse"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
