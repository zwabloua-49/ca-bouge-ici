import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Database,
  Check,
  X,
  Server,
  Zap,
  Droplet,
  Car,
  AlertTriangle,
} from 'lucide-react';
import { AbuseReport, Report, VerificationStatus } from '../types';
import { StorageService } from '../services/storageService';
import { REPORT_CATEGORIES, VERIFICATION_STATUSES } from '../utils/formatters';

interface AdminModerationProps {
  reports: Report[];
  onUpdateReports: (reports: Report[]) => void;
  onResetData: () => void;
  activeCommune: string;
}

export const AdminModeration: React.FC<AdminModerationProps> = ({
  reports,
  onUpdateReports,
  onResetData,
  activeCommune,
}) => {
  const [abuses, setAbuses] = useState<AbuseReport[]>(StorageService.getAbuseReports());
  const [filterAbuseStatus, setFilterAbuseStatus] = useState<'pending' | 'all'>('pending');
  const [activeSubTab, setActiveSubTab] = useState<'moderation' | 'reports_management' | 'architecture'>('moderation');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const pendingAbuses = abuses.filter((a) => a.status === 'pending');
  const displayedAbuses =
    filterAbuseStatus === 'pending'
      ? pendingAbuses
      : abuses;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleDismissAbuse = (abuseId: string) => {
    const res = StorageService.reviewAbuseReport(abuseId, 'dismiss');
    setAbuses(res.abuses);
    showFeedback("Signalement d'abus rejeté (le contenu reste visible).");
  };

  const handleDeleteReportFromAbuse = (abuseId: string) => {
    const res = StorageService.reviewAbuseReport(abuseId, 'delete_target_report');
    setAbuses(res.abuses);
    onUpdateReports(res.reports);
    showFeedback("Signalement supprimé de la plateforme.");
  };

  const handleStatusChange = (reportId: string, newStatus: VerificationStatus) => {
    const updated = StorageService.updateStatus(reportId, newStatus);
    onUpdateReports(updated);
    showFeedback(`Statut mis à jour : ${VERIFICATION_STATUSES[newStatus].label}`);
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm("Confirmer la suppression définitive de ce signalement ?")) {
      const updated = StorageService.deleteReport(reportId);
      onUpdateReports(updated);
      showFeedback("Signalement supprimé.");
    }
  };

  const getReasonLabel = (reason: AbuseReport['reason']) => {
    switch (reason) {
      case 'fausse_information':
        return 'Fausse information / Canular';
      case 'spam':
        return 'Spam ou publicité';
      case 'propos_inappropries':
        return 'Propos déplacés / Diffamation';
      case 'doublon':
        return 'Doublon';
      default:
        return 'Autre';
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5 text-emerald-950" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              Administration & Modération locale
            </h2>
            <p className="text-xs text-slate-300">
              Supervision des signalements, modération des abus et gestion des données
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Réinitialiser toutes les données de démo pour Port-Bouët / Gonzagueville ?")) {
                onResetData();
                setAbuses([]);
                showFeedback("Données réinitialisées à l'état initial.");
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Restaurer les données de test initiales"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser démo</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Signalements actifs
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
            {reports.filter((r) => r.status !== 'resolu').length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            dont {reports.filter((r) => r.status === 'confirme').length} confirmés
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
            Abus en attente
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-600 tabular-nums">
            {pendingAbuses.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            À traiter par la modération
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
            Incidents résolus
          </span>
          <span className="text-xl sm:text-2xl font-black text-teal-700 tabular-nums">
            {reports.filter((r) => r.status === 'resolu').length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Courant / Eau rétablis
          </span>
        </div>
      </div>

      {/* 3. Sub Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('moderation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'moderation'
              ? 'bg-rose-100 text-rose-900'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Signalements d'abus ({pendingAbuses.length})
        </button>

        <button
          onClick={() => setActiveSubTab('reports_management')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'reports_management'
              ? 'bg-emerald-100 text-emerald-900'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tous les signalements ({reports.length})
        </button>

        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'architecture'
              ? 'bg-amber-100 text-amber-900'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Architecture & Mise en ligne
        </button>
      </div>

      {/* Tab 1: Moderation of Abuses */}
      {activeSubTab === 'moderation' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Files des réclamations d'abus
            </h3>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterAbuseStatus('pending')}
                className={`px-2.5 py-1 rounded-md font-medium ${
                  filterAbuseStatus === 'pending'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                En attente ({pendingAbuses.length})
              </button>
              <button
                onClick={() => setFilterAbuseStatus('all')}
                className={`px-2.5 py-1 rounded-md font-medium ${
                  filterAbuseStatus === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Tout l'historique
              </button>
            </div>
          </div>

          {displayedAbuses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">
                Aucun abus en attente
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                La communauté participe sereinement. Les signalements frauduleux
                ou diffamatoires signalés par les résidents apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedAbuses.map((abuse) => (
                <div
                  key={abuse.id}
                  className="bg-white rounded-2xl border border-rose-200/80 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-block mb-1">
                        {getReasonLabel(abuse.reason)}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        « {abuse.reportTitle} »
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        abuse.status === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {abuse.status === 'pending' ? 'À traiter' : 'Traité'}
                    </span>
                  </div>

                  {abuse.comment && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Commentaire du plaignant :</strong> {abuse.comment}
                    </div>
                  )}

                  {abuse.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleDismissAbuse(abuse.id)}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                      >
                        Rejeter l'abus (Conserver le signalement)
                      </button>
                      <button
                        onClick={() => handleDeleteReportFromAbuse(abuse.id)}
                        className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer le contenu</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Reports Management */}
      {activeSubTab === 'reports_management' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Gestion des signalements de la commune
          </h3>

          <div className="space-y-2.5">
            {reports.map((rep) => {
              const stMeta = VERIFICATION_STATUSES[rep.status];

              return (
                <div
                  key={rep.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stMeta.badgeBg} ${stMeta.badgeText}`}>
                        {stMeta.label}
                      </span>
                      <span className="text-xs text-slate-500">{rep.quartier}</span>
                      {rep.isDemo && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded">
                          Démo
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {rep.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {rep.landmark} · Confirmations : {rep.confirmationsCount} · Contestations : {rep.contestationsCount}
                    </p>
                  </div>

                  {/* Quick Status Setter */}
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    <select
                      value={rep.status}
                      onChange={(e) => handleStatusChange(rep.id, e.target.value as VerificationStatus)}
                      className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white font-medium outline-none"
                    >
                      <option value="non_verifie">Non vérifié</option>
                      <option value="en_cours">En cours</option>
                      <option value="confirme">Confirmé</option>
                      <option value="resolu">Résolu</option>
                    </select>

                    <button
                      onClick={() => handleDeleteReport(rep.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Technical Architecture & Production Roadmap */}
      {activeSubTab === 'architecture' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <Server className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-base text-slate-900">
              Architecture technique & Prochaines étapes de déploiement
            </h3>
          </div>

          <div className="bg-emerald-50/90 border border-emerald-300 p-3.5 rounded-xl text-xs text-emerald-950 space-y-2">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Diagnostic Cloud Firestore & Accès Console
            </span>
            <p>
              L'application est connectée à votre base Cloud Firestore nommée :
              <br />
              <code className="font-mono text-[11px] bg-emerald-100/90 px-1.5 py-0.5 rounded text-emerald-900 mt-1 inline-block font-bold">
                ai-studio-abougeici-a0a7c3d2-7dcd-467e-bc3c-222403be3836
              </code>
            </p>
            <div className="bg-white p-3 rounded-lg border border-emerald-200 text-slate-800 space-y-1">
              <span className="font-bold block text-slate-900">
                ⚠️ Pourquoi la collection n'apparaît pas par défaut dans la console Firebase ?
              </span>
              <p className="text-[11px] leading-relaxed text-slate-600">
                1. Dans la console Firebase, le menu déroulant en haut de la page Firestore affiche par défaut la base <strong>(default)</strong>. Vous devez cliquer sur ce menu pour sélectionner <strong>ai-studio-abougeici-a0a7c3d2-7dcd-467e-bc3c-222403be3836</strong>.
              </p>
              <p className="text-[11px] leading-relaxed text-slate-600">
                2. Dans Firestore, une collection n'apparaît dans la console <strong>qu'après l'écriture réussie d'au moins un premier document</strong>.
              </p>
              <div className="pt-2">
                <a
                  href="https://console.firebase.google.com/project/encouraging-bonito-wlxdt/firestore/databases/ai-studio-abougeici-a0a7c3d2-7dcd-467e-bc3c-222403be3836/data"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-900 transition-colors"
                >
                  Ouvrir la base exacte dans la Console Firebase ↗
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Feuille de route pour la mise en production à Abidjan :
            </h4>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-900 block">
                    Base de données temps réel (Firebase Firestore)
                  </strong>
                  Synchronisation instantanée des coupures CIE/SODECI et bouchons
                  entre tous les smartphones des habitants du quartier.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-slate-900 block">
                    Authentification sécurisée par téléphone (SMS / OTP)
                  </strong>
                  Connexion par numéro de mobile ivoirien (+225) pour certifier
                  l'identité des résidents et éliminer le spam.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-900 block">
                    Notifications d'urgence ciblées
                  </strong>
                  Alertes instantanées transmises par notification PWA ou passerelle
                  WhatsApp lors d'une coupure d'eau prolongée ou d'une perturbation majeure
                  sur la Route de Bassam.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong className="text-slate-900 block">
                    PWA (Progressive Web App) installable
                  </strong>
                  Fonctionnement hors-ligne et ajout direct sur l'écran d'accueil
                  Android avec consommation minimale de données.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
