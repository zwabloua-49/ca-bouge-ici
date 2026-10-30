import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AbuseReason, Report } from '../types';

interface AbuseModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitAbuse: (reportId: string, reportTitle: string, reason: AbuseReason, comment: string) => void;
}

export const AbuseModal: React.FC<AbuseModalProps> = ({
  report,
  isOpen,
  onClose,
  onSubmitAbuse,
}) => {
  const [reason, setReason] = useState<AbuseReason>('fausse_information');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !report) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAbuse(report.id, report.title, reason, comment);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 1600);
  };

  const reasonOptions: { id: AbuseReason; label: string; desc: string }[] = [
    {
      id: 'fausse_information',
      label: 'Fausse information / Rumeur',
      desc: "L'incident n'existe pas ou la situation a été inventée",
    },
    {
      id: 'spam',
      label: 'Spam ou publicité abusive',
      desc: 'Message répétitif, arnaque ou contenu commercial non sollicité',
    },
    {
      id: 'propos_inappropries',
      label: 'Propos inappropriés ou diffamation',
      desc: 'Injures, atteinte à la vie privée, incitation à la haine',
    },
    {
      id: 'doublon',
      label: 'Signalement en doublon',
      desc: 'Cet événement a déjà été signalé récemment',
    },
    {
      id: 'autre',
      label: 'Autre motif',
      desc: 'Précisez la raison ci-dessous',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-slate-900 text-sm">
              Signaler un abus ou contenu suspect
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              Signalement d'abus transmis
            </h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Merci de préserver la qualité des informations de notre quartier.
              Notre équipe de modération va examiner ce signalement en priorité.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Signalement concerné
              </span>
              <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                {report.title}
              </p>
              <span className="text-[11px] text-slate-500">
                {report.quartier} · {report.authorName}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                Motif du signalement
              </label>
              <div className="space-y-1.5">
                {reasonOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      reason === opt.id
                        ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="abuseReason"
                      value={opt.id}
                      checked={reason === opt.id}
                      onChange={() => setReason(opt.id)}
                      className="mt-1 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="text-xs font-semibold block">{opt.label}</span>
                      <span className="text-[11px] text-slate-500 leading-tight block">
                        {opt.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Détails complémentaires (facultatif)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex : J'habite exactement à ce carrefour et le courant est bien présent..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Confirmer le signalement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
