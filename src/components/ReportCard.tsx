import React, { useState } from 'react';
import {
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  Zap,
  Droplet,
  Car,
  AlertTriangle,
  Calendar,
  Tag,
  Info,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  HeartHandshake,
  Trash2,
} from 'lucide-react';
import { AppUser, Report } from '../types';
import {
  formatTimeAgo,
  REPORT_CATEGORIES,
  VERIFICATION_STATUSES,
} from '../utils/formatters';

interface ReportCardProps {
  report: Report;
  onVote: (id: string, type: 'confirm' | 'contest') => void;
  onOpenAbuseModal: (report: Report) => void;
  onDeleteReport?: (id: string) => void;
  lowDataMode: boolean;
  currentUser?: AppUser | null;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onVote,
  onOpenAbuseModal,
  onDeleteReport,
  lowDataMode,
  currentUser,
}) => {
  const [showImageFull, setShowImageFull] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [revealedLowDataImage, setRevealedLowDataImage] = useState(false);

  const categoryMeta = REPORT_CATEGORIES[report.category] || REPORT_CATEGORIES.autre;
  const statusMeta = VERIFICATION_STATUSES[report.status] || VERIFICATION_STATUSES.non_verifie;

  const isAuthorOrAdmin =
    (currentUser && report.authorId && currentUser.uid === report.authorId) ||
    currentUser?.role === 'admin';

  const getCategoryIcon = () => {
    switch (report.category) {
      case 'electricite':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'eau':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'circulation':
        return <Car className="w-4 h-4 text-orange-600" />;
      case 'route':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'evenement':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'entraide':
        return <HeartHandshake className="w-4 h-4 text-indigo-600" />;
      case 'commerce_promo':
        return <Tag className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleShare = async () => {
    const text = `[Ça Bouge Ici - ${report.quartier}] ${report.title} : ${report.description} (Repère : ${report.landmark})`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: text,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const shouldRenderImage = report.imageUrl && (!lowDataMode || revealedLowDataImage);

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors p-4 sm:p-5 flex flex-col gap-3">
      {/* 1. Header Metadata: unboxed clean text (Zero-Pill discipline) */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
            {getCategoryIcon()}
          </div>
          <span className="font-semibold text-slate-700">{categoryMeta.shortLabel}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-600">{report.quartier}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="tabular-nums">{formatTimeAgo(report.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          {report.isDemo && (
            <span className="text-[10px] text-amber-700 font-medium shrink-0 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60" title="Exemple généré pour tester l'application">
              Démo
            </span>
          )}

          {isAuthorOrAdmin && onDeleteReport && (
            <button
              onClick={() => onDeleteReport(report.id)}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
              title="Supprimer ma publication"
              aria-label="Supprimer ma publication"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Title & Status Banner */}
      <div>
        <h3 className="text-base font-bold text-slate-900 leading-snug">
          {report.title}
        </h3>

        {/* Verification Status Banner */}
        <div className="flex items-center gap-2 mt-1.5 text-xs">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[11px] ${statusMeta.badgeBg} ${statusMeta.badgeText}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotBg}`} />
            {statusMeta.label}
          </span>

          {report.status === 'resolu' && (
            <span className="text-[11px] text-teal-700 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Situation rétablie
            </span>
          )}
        </div>
      </div>

      {/* 3. Description */}
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        {report.description}
      </p>

      {/* 4. Local Landmark (Repère) */}
      {report.landmark ? (
        <div className="flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">Repère local : </span>
            <span>{report.landmark}</span>
          </div>
        </div>
      ) : null}

      {/* 5. Resolution Note (if present) */}
      {report.resolutionNote && (
        <div className="bg-teal-50/70 border border-teal-200/70 rounded-xl p-2.5 text-xs text-teal-900">
          <span className="font-bold block text-[11px] uppercase tracking-wide text-teal-800">
            Note de résolution
          </span>
          <p className="mt-0.5">{report.resolutionNote}</p>
        </div>
      )}

      {/* 6. Image Section */}
      {report.imageUrl && (
        <div>
          {shouldRenderImage ? (
            <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-16/9">
              <img
                src={report.imageUrl}
                alt={report.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                onClick={() => setShowImageFull(true)}
                className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform duration-200"
              />
              <button
                onClick={() => setShowImageFull(true)}
                className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded-md backdrop-blur-xs flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> Agrandir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setRevealedLowDataImage(true)}
              className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Afficher la photo jointe (Mode Éco Data actif)</span>
            </button>
          )}
        </div>
      )}

      {/* 7. Footer: Resident Verification & Interaction */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
        {/* Author */}
        <div className="text-slate-500 text-[11px] truncate max-w-[130px] sm:max-w-[180px]">
          Par <span className="font-medium text-slate-700">{report.authorName}</span>
          {currentUser && report.authorId === currentUser.uid && (
            <span className="text-[10px] text-emerald-700 font-semibold ml-1">(Vous)</span>
          )}
        </div>

        {/* Voting & Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Confirmer */}
          <button
            onClick={() => onVote(report.id, 'confirm')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
              report.userVote === 'confirm'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
            title="Confirmer que cet incident ou événement est réel"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Je confirme</span>
            <span className="font-mono tabular-nums text-[11px] ml-0.5">
              ({report.confirmationsCount})
            </span>
          </button>

          {/* Contester */}
          <button
            onClick={() => onVote(report.id, 'contest')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
              report.userVote === 'contest'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
            }`}
            title="Contester : c'est faux ou la situation est déjà résolue"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Je conteste</span>
            <span className="font-mono tabular-nums text-[11px] ml-0.5">
              ({report.contestationsCount})
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Partager ce signalement sur WhatsApp ou message"
            aria-label="Partager"
          >
            {copiedShare ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          {/* Abuse flag */}
          <button
            onClick={() => onOpenAbuseModal(report)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Signaler un abus ou faux contenu"
            aria-label="Signaler un abus"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showImageFull && report.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowImageFull(false)}
        >
          <div className="max-w-3xl w-full">
            <img
              src={report.imageUrl}
              alt={report.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
            <p className="text-center text-white/80 text-xs mt-3">
              Touchez n'importe où pour fermer
            </p>
          </div>
        </div>
      )}
    </article>
  );
};
