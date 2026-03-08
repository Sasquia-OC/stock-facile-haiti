import { useState, useEffect, useCallback } from "react";
import { AppSettings, Language } from "@/types/product";

const BASE_SETTINGS_KEY = "biznis-pam-settings";

const DEFAULT_SETTINGS: AppSettings = {
  language: "fr",
  tauxDollar: 132,
};

const translations: Record<string, Record<Language, string>> = {
  "dashboard": { fr: "Dashboard", ht: "Tablo" },
  "gains_today": { fr: "Gains du jour", ht: "Lajan jodi a" },
  "clients_today": { fr: "Clients du jour", ht: "Kliyan jodi a" },
  "to_restock": { fr: "À racheter", ht: "Pou rachte" },
  "capital_invested": { fr: "Capital investi", ht: "Kapital envesti" },
  "stock_value": { fr: "Valeur du stock", ht: "Valè stòk la" },
  "estimated_profit": { fr: "Bénéfice estimé", ht: "Benefis estime" },
  "most_profitable": { fr: "Plus rentable", ht: "Pi rentab" },
  "to_watch": { fr: "À surveiller", ht: "Pou siveye" },
  "products": { fr: "produits", ht: "pwodwi" },
  "alerts": { fr: "alertes", ht: "alèt" },
  "add_product": { fr: "Ajouter un produit", ht: "Ajoute yon pwodwi" },
  "product_name": { fr: "Nom du produit", ht: "Non pwodwi a" },
  "quantity": { fr: "Quantité", ht: "Kantite" },
  "buy_price": { fr: "Prix d'achat", ht: "Pri acha" },
  "sell_price": { fr: "Prix de vente", ht: "Pri vant" },
  "alert_threshold": { fr: "Seuil d'alerte", ht: "Limit alèt" },
  "new_product": { fr: "Nouveau produit", ht: "Nouvo pwodwi" },
  "add": { fr: "Ajouter", ht: "Ajoute" },
  "search": { fr: "Rechercher un produit...", ht: "Chèche yon pwodwi..." },
  "critical_products": { fr: "Produits critiques", ht: "Pwodwi kritik" },
  "stockout": { fr: "RUPTURE", ht: "FINI" },
  "low": { fr: "BAS", ht: "BA" },
  "remaining": { fr: "restant", ht: "ki rete" },
  "margin": { fr: "Marge", ht: "Maj" },
  "buy": { fr: "Achat", ht: "Acha" },
  "sell": { fr: "Vente", ht: "Vant" },
  "potential_profit": { fr: "Bénéfice potentiel", ht: "Benefis posib" },
  "critical_stock": { fr: "Stock critique", ht: "Stòk kritik" },
  "no_products": { fr: "Aucun produit trouvé", ht: "Pa gen pwodwi" },
  "sell_product": { fr: "Vendre", ht: "Vann" },
  "pos": { fr: "Point de Vente", ht: "Pwen Vant" },
  "amount_received": { fr: "Montant reçu", ht: "Lajan resevwa" },
  "change": { fr: "Monnaie à rendre", ht: "Lajan pou remèt" },
  "confirm_sale": { fr: "Confirmer la vente", ht: "Konfime vant lan" },
  "sale_success": { fr: "Vente enregistrée !", ht: "Vant anrejistre !" },
  "ai_ask": { fr: "Que dois-je faire ?", ht: "Kisa pou m fè ?" },
  "ai_analyzing": { fr: "Analyse en cours...", ht: "Ap analize..." },
  "ai_title": { fr: "Conseils IA", ht: "Konsèy IA" },
  "settings": { fr: "Paramètres", ht: "Paramèt" },
  "language": { fr: "Langue", ht: "Lang" },
  "french": { fr: "Français", ht: "Fransè" },
  "creole": { fr: "Créole", ht: "Kreyòl" },
  "theme": { fr: "Thème", ht: "Tèm" },
  "light": { fr: "Clair", ht: "Klè" },
  "dark": { fr: "Sombre", ht: "Nwa" },
  "system": { fr: "Système", ht: "Sistèm" },
  "usd_rate": { fr: "Taux USD", ht: "To dola" },
  "inventory": { fr: "Inventaire", ht: "Envantè" },
  "close": { fr: "Fermer", ht: "Fèmen" },
  "select_product": { fr: "Sélectionner un produit", ht: "Chwazi yon pwodui" },
  "qty_to_sell": { fr: "Quantité à vendre", ht: "Kantite pou vann" },
  "added_to_stock": { fr: "ajouté au stock !", ht: "ajoute nan stòk !" },
  "all_clear": { fr: "Tout est sous contrôle", ht: "Tout anba kontwòl" },
  "welcome": { fr: "Bienvenue !", ht: "Byenvini !" },
  "add_first_product": { fr: "Commencez par ajouter votre premier produit pour gérer votre stock.", ht: "Kòmanse ajoute premye pwodwi ou pou jere stòk ou." },
  "all_clear_desc": { fr: "Aucun produit en rupture ou en stock bas", ht: "Pa gen pwodwi ki fini oswa ki ba" },
  "stockout_alert": { fr: "Ruptures de stock", ht: "Pwodwi ki fini" },
  "low_stock_alert": { fr: "Stocks bas", ht: "Stòk ba" },
  "restock": { fr: "Réapprovisionner", ht: "Ranpli stòk" },
  "details": { fr: "Détails", ht: "Detay" },
  "delete": { fr: "Supprimer", ht: "Efase" },
  "auth_welcome_title": { fr: "Accéder à Ayiti Biznis", ht: "Antre nan Ayiti Biznis" },
  "auth_welcome_desc": { fr: "Gérez votre commerce — stock, ventes et bénéfices.", ht: "Jere komès ou pi byen — stòk, vant ak benefis." },
  "auth_login_title": { fr: "Connexion", ht: "Konekte" },
  "auth_signup_title": { fr: "Créer un compte", ht: "Kreye yon kont" },
  "auth_login_desc": { fr: "Entrez votre email et mot de passe", ht: "Mete imèl ak modpas ou" },
  "auth_signup_desc": { fr: "Inscrivez-vous gratuitement", ht: "Enskri gratis pou kòmanse" },
  "auth_email": { fr: "Email", ht: "Imèl" },
  "auth_password": { fr: "Mot de passe", ht: "Modpas" },
  "auth_login_btn": { fr: "Se connecter", ht: "Konekte" },
  "auth_signup_btn": { fr: "S'inscrire", ht: "Enskri" },
  "auth_no_account": { fr: "Pas encore de compte ? S'inscrire", ht: "Ou poko gen kont ? Enskri" },
  "auth_has_account": { fr: "Déjà un compte ? Se connecter", ht: "Ou gen kont deja ? Konekte" },
  "auth_signup_success": { fr: "Inscription réussie !", ht: "Enskripsyon reyisi !" },
  "auth_signup_check_email": { fr: "Vérifiez votre email pour confirmer votre compte.", ht: "Tcheke imèl ou pou konfime kont ou." },
  "auth_error": { fr: "Erreur", ht: "Erè" },
  "feedback_title": { fr: "Votre avis compte !", ht: "Opinyon ou enpòtan !" },
  "feedback_desc": { fr: "Comment trouvez-vous l'application ?", ht: "Kijan ou jwenn aplikasyon an ?" },
  "feedback_comment": { fr: "Un commentaire ? (optionnel)", ht: "Yon kòmantè ? (opsyonèl)" },
  "feedback_send": { fr: "Envoyer", ht: "Voye" },
  "feedback_thanks": { fr: "Merci pour votre avis !", ht: "Mèsi pou opinyon ou !" },
  "feedback_sent": { fr: "Feedback envoyé", ht: "Feedback voye" },
  "logout": { fr: "Déconnexion", ht: "Dekonekte" },
  "reports": { fr: "Rapports", ht: "Rapò" },
  "report_daily": { fr: "Aujourd'hui", ht: "Jodi a" },
  "report_weekly": { fr: "Cette semaine", ht: "Semèn sa a" },
  "report_monthly": { fr: "Ce mois", ht: "Mwa sa a" },
  "report_yearly": { fr: "Cette année", ht: "Ane sa a" },
  "report_revenue": { fr: "Chiffre d'affaires", ht: "Lajan antre" },
  "report_transactions": { fr: "Transactions", ht: "Tranzaksyon" },
  "report_items_sold": { fr: "Articles vendus", ht: "Atik vann" },
  "report_avg_sale": { fr: "Vente moyenne", ht: "Vant mwayèn" },
  "report_top_product": { fr: "Produit star", ht: "Pwodwi vedèt" },
  "report_no_sales": { fr: "Aucune vente sur cette période", ht: "Pa gen vant nan peryòd sa a" },
};

export function useSettings() {
  // Settings are shared (language/theme preference), not user-scoped
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(BASE_SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(BASE_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[settings.language] || key;
    },
    [settings.language]
  );

  const setLanguage = (lang: Language) => setSettings((s) => ({ ...s, language: lang }));
  const setTauxDollar = (taux: number) => setSettings((s) => ({ ...s, tauxDollar: taux }));

  const toUSD = (htg: number) => htg / settings.tauxDollar;
  const toHTG = (usd: number) => usd * settings.tauxDollar;

  return { settings, t, setLanguage, setTauxDollar, toUSD, toHTG };
}
