import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { products, sales, language } = await req.json();

    // Payload size limits
    if (!Array.isArray(products) || products.length > 200) {
      return new Response(
        JSON.stringify({ error: "Trop de produits (max 200)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!Array.isArray(sales) || sales.length > 500) {
      return new Response(
        JSON.stringify({ error: "Trop de ventes (max 500)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ht" ? "Kreyòl Ayisyen" : "Français";

    const systemPrompt = `Tu es un assistant commercial pour un petit commerçant en Haïti. Tu analyses les données de son stock et ses ventes pour donner des conseils simples et pratiques.

RÈGLES:
- Réponds en ${lang}
- Sois concis (max 4-5 conseils)
- Utilise des phrases courtes et simples
- Donne des chiffres concrets quand possible
- Concentre-toi sur: produits à réapprovisionner, produits rentables, tendances de vente, promotions suggérées
- Les prix sont en Gourdes haïtiennes (HTG)
- Formate avec des emojis pour la lisibilité`;

    const userMessage = `Voici mes données:

STOCK (${products.length} produits):
${products.map((p: any) => `- ${p.nom}: ${p.quantite} unités, achat ${p.prixAchat} HTG, vente ${p.prixVente} HTG, seuil alerte: ${p.seuilAlerte}`).join("\n")}

VENTES RÉCENTES (${sales.length} dernières):
${sales.slice(0, 20).map((s: any) => `- ${s.productName}: ${s.quantite}x à ${s.prixVente} HTG le ${new Date(s.date).toLocaleDateString("fr-FR")}`).join("\n") || "Aucune vente enregistrée"}

Analyse ces données et donne-moi des conseils pratiques pour améliorer mon commerce.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
