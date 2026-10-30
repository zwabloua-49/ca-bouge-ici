import { BusinessCategory, ReportCategory, VerificationStatus } from '../types';

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 2) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Récemment';
  }
}

export function formatFullDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export interface CategoryInfo {
  label: string;
  shortLabel: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  borderCol: string;
  description: string;
}

export const REPORT_CATEGORIES: Record<ReportCategory, CategoryInfo> = {
  electricite: {
    label: "Coupure d'électricité (CIE)",
    shortLabel: 'Électricité',
    iconName: 'Zap',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    borderCol: 'border-amber-300',
    description: 'Transformateur, câbles tombés, délestage de secteur',
  },
  eau: {
    label: "Coupure d'eau (SODECI)",
    shortLabel: 'Eau',
    iconName: 'Droplet',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    borderCol: 'border-blue-300',
    description: 'Baisse de pression, coupure générale, fuite sur voie publique',
  },
  circulation: {
    label: 'Circulation & Transport',
    shortLabel: 'Circulation',
    iconName: 'Car',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    borderCol: 'border-orange-300',
    description: 'Embouteillage, accident, camion en panne, axe bloqué',
  },
  route: {
    label: 'Route dégradée & Travaux',
    shortLabel: 'Route',
    iconName: 'AlertTriangle',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    borderCol: 'border-rose-300',
    description: 'Nid-de-poule dangereux, inondation, chaussée rétrécie',
  },
  evenement: {
    label: 'Événement & Vie locale',
    shortLabel: 'Événement',
    iconName: 'Calendar',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    borderCol: 'border-emerald-300',
    description: 'Maracana, concert, kermesse, réunion de quartier, cérémonie',
  },
  entraide: {
    label: 'Demande & Offre d’entraide',
    shortLabel: 'Entraide',
    iconName: 'HeartHandshake',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    borderCol: 'border-indigo-300',
    description: 'Covoiturage, aide aux devoirs, prêt d’outils, soutien entre voisins',
  },
  commerce_promo: {
    label: 'Commerce & Bon plan',
    shortLabel: 'Bons plans',
    iconName: 'Tag',
    badgeBg: 'bg-yellow-50',
    badgeText: 'text-yellow-900',
    borderCol: 'border-yellow-300',
    description: 'Promotion locale, arrivage, ouverture nouvelle boutique',
  },
  autre: {
    label: 'Autre information utile',
    shortLabel: 'Info utile',
    iconName: 'Info',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    borderCol: 'border-slate-300',
    description: 'Objet perdu, annonce de salubrité publique, collecte',
  },
};

export interface StatusInfo {
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  dotBg: string;
  description: string;
}

export const VERIFICATION_STATUSES: Record<VerificationStatus, StatusInfo> = {
  non_verifie: {
    label: 'Non vérifié',
    shortLabel: 'Nouveau',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    dotBg: 'bg-slate-400',
    description: 'Signalé récemment, en attente de confirmations locales',
  },
  en_cours: {
    label: 'En cours de confirmation',
    shortLabel: 'En cours',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    dotBg: 'bg-amber-500',
    description: 'Plusieurs habitants ont confirmé ce signalement',
  },
  confirme: {
    label: 'Confirmé par les résidents',
    shortLabel: 'Confirmé',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    dotBg: 'bg-emerald-600',
    description: 'Attesté par de nombreux témoins du quartier',
  },
  resolu: {
    label: 'Résolu / Rétabli',
    shortLabel: 'Résolu',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-900',
    dotBg: 'bg-teal-600',
    description: "La situation est rentrée dans l'ordre (ex: courant revenu)",
  },
};

export const BUSINESS_CATEGORIES: Record<BusinessCategory, { label: string; iconName: string }> = {
  pharmacie: { label: 'Pharmacies & Santé', iconName: 'Cross' },
  maquis: { label: 'Maquis & Restaurants', iconName: 'Utensils' },
  superette: { label: 'Alimentation & Supérettes', iconName: 'ShoppingBag' },
  services: { label: 'Transferts d’argent & Agences', iconName: 'Smartphone' },
  artisanat: { label: 'Artisans, Ateliers & Dépannage', iconName: 'Wrench' },
};
