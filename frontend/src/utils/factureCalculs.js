// src/utils/factureCalculs.js

/**
 * Calcule les totaux d'une facture selon la méthode choisie
 * @param {Array} articles - liste des articles de la facture
 * @param {string} methode - 'ht_tva' | 'remise_ligne' | 'remise_globale' | 'tva_categorie'
 * @param {number} tva_pct - taux TVA global (méthode ht_tva et remise_globale)
 * @param {number} remise_globale_pct - remise en % (méthode remise_globale)
 */
export const calculerTotaux = (articles = [], methode = 'ht_tva', tva_pct = 20, remise_globale_pct = 0) => {
  let total_ht = 0;
  let tva = 0;
  let montant_remise = 0;
  const articlesCalcules = [];

  articles.forEach(a => {
    const qte = Number(a.quantite) || 0;
    const pu = Number(a.prix_unitaire) || 0;
    const remise_ligne_pct = Number(a.remise_pct) || 0;
    const tva_article = Number(a.tva_pct) || tva_pct;

    let ht_ligne = qte * pu;
    let remise_montant = 0;
    let tva_ligne = 0;

    if (methode === 'ht_tva') {
      tva_ligne = ht_ligne * (tva_pct / 100);
    } else if (methode === 'remise_ligne') {
      remise_montant = ht_ligne * (remise_ligne_pct / 100);
      ht_ligne = ht_ligne - remise_montant;
      tva_ligne = ht_ligne * (tva_pct / 100);
    } else if (methode === 'remise_globale') {
      tva_ligne = ht_ligne * (tva_pct / 100);
    } else if (methode === 'tva_categorie') {
      tva_ligne = ht_ligne * (tva_article / 100);
    }

    total_ht += ht_ligne;
    tva += tva_ligne;

    articlesCalcules.push({
      ...a,
      total_ht_ligne: ht_ligne,
      tva_ligne,
      remise_ligne_montant: remise_montant
    });
  });

  // Remise globale appliquée après le total HT
  if (methode === 'remise_globale' && remise_globale_pct > 0) {
    montant_remise = total_ht * (remise_globale_pct / 100);
    const ht_apres_remise = total_ht - montant_remise;
    // Recalcul TVA sur base après remise
    tva = ht_apres_remise * (tva_pct / 100);
    total_ht = ht_apres_remise;
  }

  const total_ttc = total_ht + tva;

  return {
    articles: articlesCalcules,
    total_ht: Math.round(total_ht * 100) / 100,
    tva: Math.round(tva * 100) / 100,
    total_ttc: Math.round(total_ttc * 100) / 100,
    montant_remise: Math.round(montant_remise * 100) / 100
  };
};

export const STATUTS = {
  en_attente: { label: 'En attente', color: 'warning' },
  payee: { label: 'Payée', color: 'success' },
  rejetee: { label: 'Rejetée', color: 'error' }
};

export const METHODES_FACTURATION = [
  { value: 'ht_tva', label: 'HT + TVA standard' },
  { value: 'remise_ligne', label: 'Remise par ligne' },
  { value: 'remise_globale', label: 'Remise globale' },
  { value: 'tva_categorie', label: 'TVA par catégorie d\'article' }
];

export const TYPES_VIREMENT = [
  'Virement bancaire',
  'Chèque',
  'Espèces',
  'Carte bancaire',
  'Prélèvement automatique',
  'PayPal'
];
