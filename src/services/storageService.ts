import { Business, Report, AbuseReport, VerificationStatus } from '../types';
import { INITIAL_BUSINESSES, INITIAL_REPORTS } from '../data/initialData';

const REPORTS_KEY = 'ca_bouge_ici_reports_v1';
const BUSINESSES_KEY = 'ca_bouge_ici_businesses_v1';
const ABUSE_KEY = 'ca_bouge_ici_abuse_v1';
const USER_VOTES_KEY = 'ca_bouge_ici_user_votes_v1';
const LOW_DATA_KEY = 'ca_bouge_ici_low_data_v1';
const ACTIVE_LOCATION_KEY = 'ca_bouge_ici_active_location_v1';

export class StorageService {
  static getReports(): Report[] {
    try {
      const stored = localStorage.getItem(REPORTS_KEY);
      if (!stored) {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
        return INITIAL_REPORTS;
      }
      const reports: Report[] = JSON.parse(stored);
      // Attach user's saved votes from this browser session
      const userVotes = this.getUserVotes();
      return reports.map((r) => ({
        ...r,
        userVote: userVotes[r.id],
      }));
    } catch {
      return INITIAL_REPORTS;
    }
  }

  static saveReports(reports: Report[]): void {
    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch {
      // storage quota or private browsing fallback
    }
  }

  static addReport(newReport: Omit<Report, 'id' | 'createdAt' | 'confirmationsCount' | 'contestationsCount' | 'abuseReportsCount' | 'isDemo'>): Report {
    const reports = this.getReports();
    const created: Report = {
      ...newReport,
      id: `rep-user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      confirmationsCount: 1, // Author confirms implicitly
      contestationsCount: 0,
      abuseReportsCount: 0,
      userVote: 'confirm',
      isDemo: false,
    };

    const updated = [created, ...reports];
    this.saveReports(updated);
    this.setUserVote(created.id, 'confirm');
    return created;
  }

  static voteReport(reportId: string, voteType: 'confirm' | 'contest'): { reports: Report[]; newVote?: 'confirm' | 'contest' } {
    const reports = this.getReports();
    const userVotes = this.getUserVotes();
    const currentVote = userVotes[reportId];

    let nextVote: 'confirm' | 'contest' | undefined = voteType;
    if (currentVote === voteType) {
      // Cancel vote
      nextVote = undefined;
    }

    const updated = reports.map((r) => {
      if (r.id !== reportId) return r;

      let conf = r.confirmationsCount;
      let cont = r.contestationsCount;

      // Deduct previous vote
      if (currentVote === 'confirm') conf = Math.max(0, conf - 1);
      if (currentVote === 'contest') cont = Math.max(0, cont - 1);

      // Apply new vote
      if (nextVote === 'confirm') conf += 1;
      if (nextVote === 'contest') cont += 1;

      // Auto update status based on verification threshold
      let newStatus: VerificationStatus = r.status;
      if (r.status !== 'resolu') {
        if (conf >= 5 && cont <= 1) {
          newStatus = 'confirme';
        } else if (conf >= 2) {
          newStatus = 'en_cours';
        } else if (cont > conf + 2) {
          newStatus = 'non_verifie';
        }
      }

      return {
        ...r,
        confirmationsCount: conf,
        contestationsCount: cont,
        status: newStatus,
        userVote: nextVote,
      };
    });

    this.saveReports(updated);
    this.setUserVote(reportId, nextVote);
    return { reports: updated, newVote: nextVote };
  }

  static resolveReport(reportId: string, resolutionNote?: string): Report[] {
    const reports = this.getReports();
    const updated = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'resolu' as VerificationStatus,
          resolutionNote: resolutionNote || "Marqué comme résolu par la communauté ou l'administration.",
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    this.saveReports(updated);
    return updated;
  }

  static updateStatus(reportId: string, status: VerificationStatus): Report[] {
    const reports = this.getReports();
    const updated = reports.map((r) => (r.id === reportId ? { ...r, status, updatedAt: new Date().toISOString() } : r));
    this.saveReports(updated);
    return updated;
  }

  static deleteReport(reportId: string): Report[] {
    const reports = this.getReports().filter((r) => r.id !== reportId);
    this.saveReports(reports);
    return reports;
  }

  // ABUSE MODERATION
  static reportAbuse(reportId: string, reportTitle: string, reason: AbuseReport['reason'], comment: string): void {
    const abuses = this.getAbuseReports();
    const newAbuse: AbuseReport = {
      id: `abuse-${Date.now()}`,
      reportId,
      reportTitle,
      reason,
      comment,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    try {
      localStorage.setItem(ABUSE_KEY, JSON.stringify([newAbuse, ...abuses]));
    } catch {
      // ignore
    }

    // Increment abuse count on the report
    const reports = this.getReports();
    const updated = reports.map((r) => (r.id === reportId ? { ...r, abuseReportsCount: (r.abuseReportsCount || 0) + 1 } : r));
    this.saveReports(updated);
  }

  static getAbuseReports(): AbuseReport[] {
    try {
      const stored = localStorage.getItem(ABUSE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static reviewAbuseReport(abuseId: string, action: 'dismiss' | 'delete_target_report'): { abuses: AbuseReport[]; reports: Report[] } {
    let abuses = this.getAbuseReports();
    let reports = this.getReports();

    const target = abuses.find((a) => a.id === abuseId);
    if (target && action === 'delete_target_report') {
      reports = this.deleteReport(target.reportId);
    }

    abuses = abuses.map((a) => (a.id === abuseId ? { ...a, status: action === 'dismiss' ? 'dismissed' : 'reviewed' } : a));
    try {
      localStorage.setItem(ABUSE_KEY, JSON.stringify(abuses));
    } catch {
      // ignore
    }

    return { abuses, reports };
  }

  // BUSINESSES
  static getBusinesses(): Business[] {
    try {
      const stored = localStorage.getItem(BUSINESSES_KEY);
      if (!stored) {
        localStorage.setItem(BUSINESSES_KEY, JSON.stringify(INITIAL_BUSINESSES));
        return INITIAL_BUSINESSES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_BUSINESSES;
    }
  }

  static saveBusinesses(businesses: Business[]): void {
    try {
      localStorage.setItem(BUSINESSES_KEY, JSON.stringify(businesses));
    } catch {
      // ignore
    }
  }

  static addBusiness(business: Omit<Business, 'id' | 'isDemo' | 'lastVerifiedDate' | 'verificationNote'>): Business {
    const list = this.getBusinesses();
    const created: Business = {
      ...business,
      id: `biz-user-${Date.now()}`,
      isDemo: false,
      lastVerifiedDate: "Aujourd'hui",
      verificationNote: 'Commerce enregistré et vérifié récemment par le propriétaire',
    };
    const updated = [created, ...list];
    this.saveBusinesses(updated);
    return created;
  }

  // USER VOTES
  private static getUserVotes(): Record<string, 'confirm' | 'contest'> {
    try {
      const stored = localStorage.getItem(USER_VOTES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private static setUserVote(reportId: string, vote?: 'confirm' | 'contest'): void {
    try {
      const votes = this.getUserVotes();
      if (vote) {
        votes[reportId] = vote;
      } else {
        delete votes[reportId];
      }
      localStorage.setItem(USER_VOTES_KEY, JSON.stringify(votes));
    } catch {
      // ignore
    }
  }

  // SETTINGS & LOW DATA MODE
  static getLowDataMode(): boolean {
    try {
      return localStorage.getItem(LOW_DATA_KEY) === 'true';
    } catch {
      return false;
    }
  }

  static setLowDataMode(enabled: boolean): void {
    try {
      localStorage.setItem(LOW_DATA_KEY, enabled ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  static getActiveLocation(): { city: string; commune: string; quartier: string } {
    try {
      const stored = localStorage.getItem(ACTIVE_LOCATION_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      city: 'Abidjan',
      commune: 'Port-Bouët (Zone pilote)',
      quartier: 'Tous les quartiers de Port-Bouët',
    };
  }

  static setActiveLocation(location: { city: string; commune: string; quartier: string }): void {
    try {
      localStorage.setItem(ACTIVE_LOCATION_KEY, JSON.stringify(location));
    } catch {
      // ignore
    }
  }

  static resetAllToDemo(): { reports: Report[]; businesses: Business[] } {
    localStorage.removeItem(REPORTS_KEY);
    localStorage.removeItem(BUSINESSES_KEY);
    localStorage.removeItem(ABUSE_KEY);
    localStorage.removeItem(USER_VOTES_KEY);
    return {
      reports: INITIAL_REPORTS,
      businesses: INITIAL_BUSINESSES,
    };
  }
}
