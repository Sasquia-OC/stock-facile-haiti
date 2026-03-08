import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, X, Loader2 } from "lucide-react";
import { Product, Sale } from "@/types/product";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AiAssistantProps {
  products: Product[];
  sales: Sale[];
  language: "fr" | "ht";
  t: (key: string) => string;
}

export function AiAssistant({ products, sales, language, t }: AiAssistantProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const askAI = async () => {
    setOpen(true);
    setLoading(true);
    setResponse("");

    try {
      // Get the current session token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Vous devez être connecté pour utiliser l'assistant IA");
        setLoading(false);
        return;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ products, sales, language }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur" }));
        toast.error(err.error || "Erreur du service IA");
        setLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setResponse(content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Impossible de contacter l'assistant IA");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={askAI}
        className="w-full gap-3 h-14 text-base bg-primary hover:bg-primary/90 shadow-lg"
        size="lg"
      >
        <Lightbulb className="h-6 w-6" />
        {t("ai_ask")}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-bold">{t("ai_title")}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading && !response && (
        <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">{t("ai_analyzing")}</span>
        </div>
      )}

      {response && (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}

      {!loading && response && (
        <Button onClick={askAI} variant="outline" className="w-full gap-2">
          <Lightbulb className="h-4 w-4" />
          {t("ai_ask")}
        </Button>
      )}
    </div>
  );
}
