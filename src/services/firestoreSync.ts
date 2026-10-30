import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Business, Report, AbuseReport, VerificationStatus, ReportCategory } from '../types';
import { INITIAL_BUSINESSES, INITIAL_REPORTS } from '../data/initialData';

export const PUBLICATIONS_PATH = 'publications';
export const BUSINESSES_PATH = 'businesses';
export const ABUSE_PATH = 'abuse_reports';

/**
 * Normalizes Firestore date fields (string, number, Timestamp, etc.) to ISO 8601 string
 */
export function normalizeFirestoreDate(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  if (typeof val === 'object' && val !== null) {
    if ('toDate' in val && typeof (val as { toDate?: () => Date }).toDate === 'function') {
      try {
        return (val as { toDate: () => Date }).toDate().toISOString();
      } catch {
        return new Date().toISOString();
      }
    }
    if ('seconds' in val && typeof (val as { seconds?: number }).seconds === 'number') {
      return new Date((val as { seconds: number }).seconds * 1000).toISOString();
    }
  }
  return new Date().toISOString();
}

/**
 * Normalizes category (accepts French, English, accents, and varied casing)
 */
export function normalizeCategory(cat: unknown): ReportCategory {
  if (typeof cat !== 'string') return 'autre';
  const c = cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (c.includes('electr') || c.includes('courant') || c.includes('cie') || c.includes('lumiere')) return 'electricite';
  if (c.includes('eau') || c.includes('sodeci') || c.includes('robinet') || c.includes('tuyau')) return 'eau';
  if (c.includes('circul') || c.includes('trafic') || c.includes('bouchon') || c.includes('transport') || c.includes('gbaka') || c.includes('woro')) return 'circulation';
  if (c.includes('rout') || c.includes('nid') || c.includes('chaussee') || c.includes('voirie') || c.includes('trou')) return 'route';
  if (c.includes('even') || c.includes('fete') || c.includes('maracana') || c.includes('ceremonie')) return 'evenement';
  if (c.includes('comm') || c.includes('promo') || c.includes('boutique') || c.includes('magasin')) return 'commerce_promo';
  if (c.includes('entraide') || c.includes('solidar') || c.includes('aide') || c.includes('don')) return 'entraide';
  return 'autre';
}

/**
 * Normalizes verification status
 */
export function normalizeStatus(status: unknown): VerificationStatus {
  if (typeof status !== 'string') return 'non_verifie';
  const s = status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (s === 'confirme' || s === 'valide') return 'confirme';
  if (s === 'en_cours' || s === 'en cours') return 'en_cours';
  if (s === 'resolu' || s === 'regle') return 'resolu';
  return 'non_verifie';
}

export class FirestoreSyncService {
  /**
   * Helper to parse any Firestore document from "publications" into a strict Report type
   */
  static parsePublicationDoc(docId: string, data: Record<string, unknown>): Report {
    // 1. Title / Titre
    const title = String(
      data.title || data.titre || data.nom || data.subject || data.name || 'Publication locale'
    ).trim();

    // 2. Description / Détails / Contenu
    const description = String(
      data.description || data.desc || data.contenu || data.texte || data.message || data.details || ''
    ).trim();

    // 3. Category / Catégorie
    const category = normalizeCategory(data.category || data.categorie || data.cat || data.type);

    // 4. Date / CreatedAt / Timestamp
    const createdAt = normalizeFirestoreDate(
      data.createdAt || data.date || data.created_at || data.timestamp || data.dateCreation
    );

    // 5. Status / Statut
    const status = normalizeStatus(data.status || data.statut || data.etat);

    // 6. Commune / Quartier / City
    const city = String(data.city || data.ville || 'Abidjan').trim();
    const commune = String(data.commune || 'Port-Bouët (Zone pilote)').trim();
    const quartier = String(data.quartier || 'Gonzagueville (Terre Rouge)').trim();
    const landmark = String(data.landmark || data.repere || data.lieu || data.adresse || '').trim();

    // 7. Author information
    const authorId = typeof data.authorId === 'string' ? data.authorId : (typeof data.auteurId === 'string' ? data.auteurId : undefined);
    const authorName = String(data.authorName || data.auteur || data.author || data.nomAuteur || 'Résident').trim();
    const authorPhone = typeof data.authorPhone === 'string' ? data.authorPhone : undefined;

    // 8. Image
    const rawImage = data.imageUrl || data.image || data.photo || data.photoUrl;
    const imageUrl = typeof rawImage === 'string' && rawImage.trim().length > 0 ? rawImage.trim() : undefined;

    // 9. Confirmations & votes
    const confirmationsCount = typeof data.confirmationsCount === 'number'
      ? data.confirmationsCount
      : (Array.isArray(data.confirmedBy) ? data.confirmedBy.length : 1);
    const contestationsCount = typeof data.contestationsCount === 'number'
      ? data.contestationsCount
      : (Array.isArray(data.contestedBy) ? data.contestedBy.length : 0);
    const confirmedBy = Array.isArray(data.confirmedBy) ? data.confirmedBy : (authorId ? [authorId] : []);
    const contestedBy = Array.isArray(data.contestedBy) ? data.contestedBy : [];

    const currentUid = auth.currentUser?.uid;
    const userVote = currentUid
      ? confirmedBy.includes(currentUid)
        ? 'confirm'
        : contestedBy.includes(currentUid)
        ? 'contest'
        : undefined
      : undefined;

    // 10. Coordinates
    const coordinates = (data.coordinates && typeof data.coordinates === 'object')
      ? (data.coordinates as Report['coordinates'])
      : { lat: 5.24, lng: -3.89, xPercent: 45, yPercent: 45 };

    return {
      id: docId,
      title,
      description,
      category,
      status,
      city,
      commune,
      quartier,
      landmark: landmark || 'Gonzagueville',
      createdAt,
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
      imageUrl,
      confirmationsCount,
      contestationsCount,
      confirmedBy,
      contestedBy,
      userVote,
      isDemo: Boolean(data.isDemo),
      authorId,
      authorName,
      authorPhone,
      resolutionNote: typeof data.resolutionNote === 'string' ? data.resolutionNote : undefined,
      coordinates,
      abuseReportsCount: typeof data.abuseReportsCount === 'number' ? data.abuseReportsCount : 0,
    };
  }

  /**
   * One-off retrieval of publications from Firestore via getDocs
   */
  static async getPublications(): Promise<Report[]> {
    try {
      // Query collection directly so documents with any schema/date format are captured
      const snap = await getDocs(collection(db, PUBLICATIONS_PATH));
      const pubs: Report[] = [];
      snap.forEach((docSnap) => {
        pubs.push(FirestoreSyncService.parsePublicationDoc(docSnap.id, docSnap.data()));
      });
      // Sort client-side by date descending
      pubs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return pubs;
    } catch (error) {
      console.error('[Firestore getPublications] Échec de récupération:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, PUBLICATIONS_PATH);
      } catch (handled) {
        throw handled;
      }
      return [];
    }
  }

  /**
   * Subscribe to realtime publications from Firestore collection "publications"
   */
  static subscribeToPublications(
    onData: (publications: Report[]) => void,
    onError?: (err: Error) => void
  ) {
    try {
      // We listen to the collection directly without compound orderBy constraint
      // to prevent Firestore from silently excluding documents with different date formats
      const colRef = collection(db, PUBLICATIONS_PATH);

      return onSnapshot(
        colRef,
        (snapshot) => {
          const pubs: Report[] = [];
          snapshot.forEach((docSnap) => {
            pubs.push(FirestoreSyncService.parsePublicationDoc(docSnap.id, docSnap.data()));
          });
          // Sort client-side by date descending
          pubs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onData(pubs);
        },
        (error) => {
          console.error('[Firestore subscribeToPublications] Erreur onSnapshot:', error);
          try {
            handleFirestoreError(error, OperationType.LIST, PUBLICATIONS_PATH);
          } catch (e) {
            onError?.(e instanceof Error ? e : new Error(String(e)));
          }
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PUBLICATIONS_PATH);
    }
  }

  // Alias for backward compatibility
  static subscribeToReports = FirestoreSyncService.subscribeToPublications;
  static getReports = FirestoreSyncService.getPublications;

  /**
   * Save a new publication into Firestore collection "publications"
   */
  static async addPublication(
    pubData: {
      title: string;
      description: string;
      category: Report['category'];
      createdAt?: string;
      city?: string;
      commune?: string;
      quartier?: string;
      landmark?: string;
      authorName?: string;
      imageUrl?: string;
      coordinates?: Report['coordinates'];
    },
    authorId: string
  ): Promise<string> {
    if (!authorId || authorId.startsWith('anon-')) {
      throw new Error(
        "Authentification requise : Vous devez être connecté avec votre compte pour enregistrer une publication durable sur Cloud Firestore."
      );
    }

    const pubId = `pub-${Date.now()}`;
    const path = `${PUBLICATIONS_PATH}/${pubId}`;

    const docPayload: Record<string, unknown> = {
      title: pubData.title.trim(),
      description: pubData.description.trim(),
      category: pubData.category,
      createdAt: pubData.createdAt || new Date().toISOString(),
      authorId,
      authorName: pubData.authorName?.trim() || 'Résident',
      city: pubData.city || 'Abidjan',
      commune: pubData.commune || 'Port-Bouët (Zone pilote)',
      quartier: pubData.quartier || 'Gonzagueville (Terre Rouge)',
      landmark: pubData.landmark?.trim() || 'Gonzagueville',
      status: 'non_verifie',
      confirmationsCount: 1,
      contestationsCount: 0,
      confirmedBy: [authorId],
      contestedBy: [],
      abuseReportsCount: 0,
      isDemo: false,
      coordinates: pubData.coordinates || { lat: 5.24, lng: -3.89, xPercent: 45, yPercent: 45 },
    };

    if (pubData.imageUrl && pubData.imageUrl.trim()) {
      docPayload.imageUrl = pubData.imageUrl.trim();
    }

    try {
      await setDoc(doc(db, PUBLICATIONS_PATH, pubId), docPayload);
      return pubId;
    } catch (error: unknown) {
      const rawMsg = error instanceof Error ? error.message : String(error);
      const errorCode = (error as { code?: string })?.code || 'inconnue';
      const detailedMessage = `Erreur Firebase [${errorCode}] : ${rawMsg}`;
      console.error(`[Firestore addPublication] Échec d'écriture dans ${path}:`, error);

      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch {
        throw new Error(detailedMessage);
      }
      throw new Error(detailedMessage);
    }
  }

  // Alias
  static addReport = FirestoreSyncService.addPublication;

  /**
   * Vote on a publication in Firestore
   */
  static async votePublication(
    publicationId: string,
    currentReport: Report,
    userId: string,
    voteType: 'confirm' | 'contest'
  ): Promise<void> {
    const path = `${PUBLICATIONS_PATH}/${publicationId}`;
    try {
      let confirmedBy = currentReport.confirmedBy || [];
      let contestedBy = currentReport.contestedBy || [];

      const hasConfirmed = confirmedBy.includes(userId);
      const hasContested = contestedBy.includes(userId);

      if (voteType === 'confirm') {
        if (hasConfirmed) {
          confirmedBy = confirmedBy.filter((id) => id !== userId);
        } else {
          confirmedBy = [...confirmedBy, userId];
          contestedBy = contestedBy.filter((id) => id !== userId);
        }
      } else {
        if (hasContested) {
          contestedBy = contestedBy.filter((id) => id !== userId);
        } else {
          contestedBy = [...contestedBy, userId];
          confirmedBy = confirmedBy.filter((id) => id !== userId);
        }
      }

      let nextStatus: VerificationStatus = currentReport.status;
      if (currentReport.status !== 'resolu') {
        if (confirmedBy.length >= 5 && contestedBy.length <= 1) {
          nextStatus = 'confirme';
        } else if (confirmedBy.length >= 2) {
          nextStatus = 'en_cours';
        } else if (contestedBy.length > confirmedBy.length + 2) {
          nextStatus = 'non_verifie';
        }
      }

      await updateDoc(doc(db, PUBLICATIONS_PATH, publicationId), {
        confirmationsCount: confirmedBy.length,
        contestationsCount: contestedBy.length,
        confirmedBy,
        contestedBy,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static voteReport = FirestoreSyncService.votePublication;

  /**
   * Mark publication as resolved in Firestore
   */
  static async resolvePublication(publicationId: string, note?: string): Promise<void> {
    const path = `${PUBLICATIONS_PATH}/${publicationId}`;
    try {
      await updateDoc(doc(db, PUBLICATIONS_PATH, publicationId), {
        status: 'resolu' as VerificationStatus,
        resolutionNote: note || 'Marqué comme résolu par la communauté ou l’administration.',
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static resolveReport = FirestoreSyncService.resolvePublication;

  /**
   * Delete publication from Firestore
   */
  static async deletePublication(publicationId: string): Promise<void> {
    const path = `${PUBLICATIONS_PATH}/${publicationId}`;
    try {
      await deleteDoc(doc(db, PUBLICATIONS_PATH, publicationId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static deleteReport = FirestoreSyncService.deletePublication;

  /**
   * Subscribe to realtime businesses
   */
  static subscribeToBusinesses(
    onData: (businesses: Business[]) => void,
    onError?: (err: Error) => void
  ) {
    try {
      const q = query(collection(db, BUSINESSES_PATH), limit(100));

      return onSnapshot(
        q,
        (snapshot) => {
          const list: Business[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name: data.name || '',
              category: data.category || 'maquis',
              description: data.description || '',
              city: data.city || 'Abidjan',
              commune: data.commune || 'Port-Bouët (Zone pilote)',
              quartier: data.quartier || 'Gonzagueville (Terre Rouge)',
              landmark: data.landmark || '',
              declaredHours: data.declaredHours || '08h00 - 20h00',
              isOnDuty: data.isOnDuty ?? false,
              lastVerifiedDate: data.lastVerifiedDate || 'Récemment',
              verificationNote: data.verificationNote || 'Vérifié localement',
              phone: data.phone || '',
              whatsapp: data.whatsapp,
              imageUrl: data.imageUrl,
              isDemo: data.isDemo ?? false,
              authorId: data.authorId,
              tags: data.tags || [],
              coordinates: data.coordinates || { lat: 5.24, lng: -3.89, xPercent: 40, yPercent: 40 },
            });
          });
          onData(list);
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, BUSINESSES_PATH);
          } catch (e) {
            onError?.(e instanceof Error ? e : new Error(String(e)));
          }
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, BUSINESSES_PATH);
    }
  }

  /**
   * Add business
   */
  static async addBusiness(
    business: Omit<Business, 'id' | 'isDemo' | 'lastVerifiedDate' | 'verificationNote'>,
    authorId: string
  ): Promise<string> {
    const bizId = `biz-${Date.now()}`;
    const path = `${BUSINESSES_PATH}/${bizId}`;
    try {
      await setDoc(doc(db, BUSINESSES_PATH, bizId), {
        ...business,
        authorId,
        isDemo: false,
        lastVerifiedDate: "Aujourd'hui",
        verificationNote: 'Commerce vérifié par son gérant résident',
        createdAt: new Date().toISOString(),
      });
      return bizId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  /**
   * Report abuse
   */
  static async reportAbuse(
    reportId: string,
    reportTitle: string,
    reason: AbuseReport['reason'],
    comment: string,
    authorId: string
  ): Promise<void> {
    const abuseId = `abuse-${Date.now()}`;
    const path = `${ABUSE_PATH}/${abuseId}`;
    try {
      await setDoc(doc(db, ABUSE_PATH, abuseId), {
        reportId,
        reportTitle,
        reason,
        comment,
        authorId,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  /**
   * Seed initial demonstration data into "publications" collection if empty
   */
  static async seedInitialData(currentUserUid?: string, currentUserName?: string): Promise<boolean> {
    try {
      const snap = await getDocs(collection(db, PUBLICATIONS_PATH));
      if (snap.empty && currentUserUid) {
        console.log(`[Firestore] Initialisation des publications dans "${PUBLICATIONS_PATH}" avec le compte ${currentUserUid}...`);
        for (const rep of INITIAL_REPORTS) {
          await setDoc(doc(db, PUBLICATIONS_PATH, rep.id), {
            ...rep,
            authorId: currentUserUid,
            authorName: currentUserName || rep.authorName,
            confirmedBy: [currentUserUid],
            contestedBy: [],
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Seed Firestore différé :", error);
      return false;
    }
  }
}
