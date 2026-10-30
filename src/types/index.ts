export type ReportCategory =
  | 'electricite'
  | 'eau'
  | 'circulation'
  | 'route'
  | 'evenement'
  | 'commerce_promo'
  | 'entraide'
  | 'autre';

export type VerificationStatus =
  | 'non_verifie'
  | 'en_cours'
  | 'confirme'
  | 'resolu';

export interface Coordinates {
  lat: number;
  lng: number;
  xPercent: number; // 0-100 for SVG responsive map
  yPercent: number; // 0-100 for SVG responsive map
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: VerificationStatus;
  city: string;
  commune: string;
  quartier: string;
  landmark: string; // "Repère", crucial in Côte d'Ivoire (e.g., 'Carrefour Corail, face à la pharmacie')
  createdAt: string; // ISO date
  updatedAt?: string;
  imageUrl?: string;
  confirmationsCount: number;
  contestationsCount: number;
  confirmedBy?: string[];
  contestedBy?: string[];
  userVote?: 'confirm' | 'contest';
  isDemo: boolean;
  authorId?: string;
  authorName: string;
  authorPhone?: string;
  resolutionNote?: string;
  coordinates: Coordinates;
  abuseReportsCount: number;
}

export type BusinessCategory =
  | 'pharmacie'
  | 'maquis'
  | 'superette'
  | 'services'
  | 'artisanat';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  city: string;
  commune: string;
  quartier: string;
  landmark: string;
  declaredHours: string;
  isOnDuty?: boolean; // For pharmacies: 'Pharmacie de garde'
  lastVerifiedDate: string; // e.g. "24 oct. 2026"
  verificationNote: string; // "Vérifié il y a 2 jours par un habitant"
  phone: string;
  whatsapp?: string;
  imageUrl?: string;
  isDemo: boolean;
  authorId?: string;
  tags: string[];
  coordinates: Coordinates;
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  commune?: string;
  quartier?: string;
  role?: 'resident' | 'admin' | 'moderator';
}

export type AbuseReason =
  | 'fausse_information'
  | 'spam'
  | 'propos_inappropries'
  | 'doublon'
  | 'autre';

export interface AbuseReport {
  id: string;
  reportId: string;
  reportTitle: string;
  reason: AbuseReason;
  comment: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export type AppTab = 'accueil' | 'carte' | 'signaler' | 'commerces' | 'profil';

export interface CommuneLocation {
  city: string;
  commune: string;
  quartiers: string[];
}
