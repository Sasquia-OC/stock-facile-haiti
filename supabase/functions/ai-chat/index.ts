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

    const { messages, products, sales, language } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ht" ? "Kreyòl Ayisyen" : "Français";

    // Build context from products/sales if provided
    let contextBlock = "";
    if (Array.isArray(products) && products.length > 0) {
      contextBlock += `\nSTOCK (${products.length} produits):\n${products.slice(0, 100).map((p: any) => `- ${p.nom}: ${p.quantite} unités, achat ${p.prixAchat} HTG, vente ${p.prixVente} HTG, seuil: ${p.seuilAlerte}`).join("\n")}`;
    }
    if (Array.isArray(sales) && sales.length > 0) {
      contextBlock += `\n\nVENTES RÉCENTES (${sales.length}):\n${sales.slice(0, 30).map((s: any) => `- ${s.productName}: ${s.quantite}x à ${s.prixVente} HTG le ${new Date(s.date).toLocaleDateString("fr-FR")}`).join("\n")}`;
    }

    const systemPrompt = `Tu es un assistant commercial intelligent pour "Ayiti Biznis", une application de gestion de stock pour les commerçants haïtiens.

RÈGLES:
- Réponds TOUJOURS en ${lang}
- Sois concis, clair et pratique
- Les prix sont en Gourdes haïtiennes (HTG)
- Utilise des emojis pour la lisibilité
- Tu peux aider avec: gestion de stock, stratégies de prix, analyse des ventes, conseils commerciaux
- Si on te pose une question hors-sujet, redirige poliment vers la gestion commerciale
${contextBlock ? `\nDONNÉES DU COMMERCE:${contextBlock}` : ""}`;

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
            ...messages.slice(-20), // Keep last 20 messages for context
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
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
