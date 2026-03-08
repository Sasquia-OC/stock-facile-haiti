export interface Product {
  id: string;
  nom: string;
  quantite: number;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
  dateAjout: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantite: number;
  prixVente: number;
  total: number;
  montantRecu: number;
  monnaie: number;
  date: string;
}

export type Language = "fr" | "ht";

export interface AppSettings {
  language: Language;
  tauxDollar: number; // HTG per 1 USD
}
