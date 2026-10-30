import React, { useState } from 'react';
import {
  Zap,
  Droplet,
  Car,
  AlertTriangle,
  Calendar,
  Tag,
  Info,
  SlidersHorizontal,
  PlusCircle,
  MapPin,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  Database,
  RefreshCw,
  AlertCircle,
  Loader2,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { Report, ReportCategory, VerificationStatus } from '../types';
import { ReportCard } from './ReportCard';
import { REPORT_CATEGORIES } from '../utils/formatters';

interface HomeFeedProps {
  reports: Report[];
  onVote: (id: string, type: 'confirm' | 'contest') => void;
  onOpenAbuseModal: (report: Report) => void;
  onOpenReportModal: () => void;
  onOpenMap: () => void;
  onDeleteReport?: (id: string) => void;
  activeCommune: string;
  activeQuartier: string;
  lowDataMode: boolean;
  currentUser?: import('../types').AppUser | null;
  onOpenDiagnostic?: () => void;
  onOpenAndroidBuild?: () => void;
  isLoadingReports?: boolean;
  reportsError?: string | null;
  isSyncing?: boolean;
  onRefreshReports?: () => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  reports,
  onVote,
  onOpenAbuseModal,
  onOpenReportModal,
  onOpenMap,
  onDeleteReport,
  activeCommune,
  activeQuartier,
  lowDataMode,
  currentUser,
  onOpenDiagnostic,
  onOpenAndroidBuild,
  isLoadingReports = false,
  reportsError = null,
  isSyncing = false,
  onRefreshReports,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  // Filter reports
  const filteredReports = reports
    .filter((r) => {
      // Location matching
      if (!activeQuartier.includes('Tous')) {
        if (r.commune === activeCommune && r.quartier !== activeQuartier) {
          // If filtering on a specific neighborhood, show exact match or let user expand
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && r.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = r.title.toLowerCase().includes(q);
        const mDesc = r.description.toLowerCase().includes(q);
        const mLandmark = r.landmark.toLowerCase().includes(q);
        const mQuartier = r.quartier.toLowerCase().includes(q);
        return mTitle || mDesc || mLandmark || mQuartier;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.confirmationsCount - a.confirmationsCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return reports.length;
    return reports.filter((r) => r.category === catId).length;
  };

  return (
    <div className="space-y-4">
      {/* 1. Hero Spotlight (Adapted for Ivorian neighborhood reality) */}
      {!lowDataMode && (
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-md text-white">
          <div className="aspect-16/9 sm:aspect-21/9 max-h-56 w-full relative">
            <img
              src="/src/assets/images/hero_gonzagueville_abidjan_1792946960110.jpg"
              alt="Gonzagueville Port-Bouët Abidjan"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>

          <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
            <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold tracking-wide uppercase mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Zone pilote : {activeCommune}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              « Le quotidien de ton quartier, en temps réel. »
            </h1>
            <p className="text-xs text-slate-200 mt-1 max-w-lg hidden sm:block">
              Vérifie l'état de l'électricité CIE, de l'eau SODECI, de la
              circulation sur la route de Bassam et trouve les commerces ouverts à
              Gonzagueville.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={onOpenReportModal}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-emerald-900" />
                <span>Publier une info</span>
              </button>

              <button
                onClick={onOpenMap}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Explorer la carte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cloud Firestore & Pilot Zone Transparency Banner */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 sm:p-4 text-xs text-emerald-950 flex flex-col gap-2.5 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-emerald-950 text-sm">
                  Base Cloud Firestore connectée
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Collection : publications
                </span>
                {isSyncing && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                    Synchronisation...
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                Vos publications sont enregistrées de façon permanente dans Firestore sur le projet{' '}
                <strong>encouraging-bonito-wlxdt</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onRefreshReports && (
              <button
                onClick={onRefreshReports}
                disabled={isSyncing}
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1 disabled:opacity-50"
                title="Actualiser les publications depuis Cloud Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            )}

            {onOpenDiagnostic && (
              <button
                onClick={onOpenDiagnostic}
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                title="Lancer le diagnostic Firestore sans frais"
              >
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Diagnostic</span>
              </button>
            )}

            {onOpenAndroidBuild && (
              <button
                onClick={onOpenAndroidBuild}
                className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0"
                title="Générer l'application mobile Android (APK) via GitHub Actions"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">APK Android</span>
              </button>
            )}

            <button
              onClick={onOpenReportModal}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Publier</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] text-emerald-900 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">Zone pilote :</span>
            <span>{activeCommune}</span>
            <span>·</span>
            <span className="font-medium text-emerald-950">
              {reports.length} publication{reports.length > 1 ? 's' : ''} chargée{reports.length > 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            DB: ai-studio-abougeici-a0a7c3d2-7dcd-467e-bc3c-222403be3836
          </span>
        </div>
      </div>

      {/* Error alert banner if Firestore sync fails */}
      {reportsError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-950 rounded-2xl p-4 flex flex-col gap-2 text-xs shadow-2xs animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-rose-950 text-sm">
                  Problème de synchronisation Cloud Firestore
                </strong>
                <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                  {reportsError}
                </p>
              </div>
            </div>
            {onRefreshReports && (
              <button
                onClick={onRefreshReports}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réessayer</span>
              </button>
            )}
          </div>
          {(reportsError.includes('token-service-api') || reportsError.includes('securetoken.googleapis.com')) && (
            <div className="pt-2 border-t border-rose-200 text-[11px] flex items-center justify-between gap-2 flex-wrap">
              <span className="text-slate-600">L'API Token Service doit être activée pour le projet 972687729437 :</span>
              <a
                href="https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=972687729437"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-rose-900 underline flex items-center gap-1"
              >
                <span>Activer gratuitement dans Google Cloud</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* 3. Search & Sort */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé, repère, panne..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
          className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none shrink-0"
        >
          <option value="recent">Plus récents</option>
          <option value="popular">Plus confirmés</option>
        </select>
      </div>

      {/* 4. Category Filter Buttons (Interactive controls) */}
      <div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Toutes les infos ({getCategoryCount('all')})
          </button>

          {Object.entries(REPORT_CATEGORIES).map(([catId, val]) => {
            const isSelected = selectedCategory === catId;
            const count = getCategoryCount(catId);
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{val.shortLabel}</span>
                <span
                  className={`text-[10px] tabular-nums font-normal ${
                    isSelected ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Status Filter Bar */}
      <div className="flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar">
        <span className="text-slate-500 font-semibold shrink-0">Statut :</span>
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-2 py-0.5 rounded-md font-medium shrink-0 ${
            selectedStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setSelectedStatus('confirme')}
          className={`px-2 py-0.5 rounded-md font-medium shrink-0 flex items-center gap-1 ${
            selectedStatus === 'confirme'
              ? 'bg-emerald-700 text-white'
              : 'text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Confirmés
        </button>
        <button
          onClick={() => setSelectedStatus('en_cours')}
          className={`px-2 py-0.5 rounded-md font-medium shrink-0 flex items-center gap-1 ${
            selectedStatus === 'en_cours'
              ? 'bg-amber-600 text-white'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          En cours
        </button>
        <button
          onClick={() => setSelectedStatus('resolu')}
          className={`px-2 py-0.5 rounded-md font-medium shrink-0 flex items-center gap-1 ${
            selectedStatus === 'resolu'
              ? 'bg-teal-700 text-white'
              : 'text-teal-800 hover:bg-teal-50'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          Résolus
        </button>
      </div>

      {/* 6. Reports Feed */}
      {isLoadingReports && reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">
            Chargement des publications depuis Cloud Firestore...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Récupération des données temps réel de la collection « publications » pour {activeCommune}.
          </p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Aucune publication pour le moment dans Cloud Firestore
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            La collection <code className="font-mono font-bold text-emerald-900 bg-emerald-50 px-1 py-0.5 rounded">publications</code> est prête sur votre projet Firebase.
            Publiez la première alerte ou le premier événement pour votre quartier !
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Publier un signalement</span>
            </button>
            {onRefreshReports && (
              <button
                onClick={onRefreshReports}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualiser la liste</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Info className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">
            Aucun signalement ne correspond à vos filtres actuels
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {reports.length} publication{reports.length > 1 ? 's existent' : ' existe'} dans la base, mais aucune ne correspond aux critères sélectionnés.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900"
            >
              Réinitialiser les filtres
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800"
            >
              Faire un signalement
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onVote={onVote}
              onOpenAbuseModal={onOpenAbuseModal}
              onDeleteReport={onDeleteReport}
              lowDataMode={lowDataMode}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};
