import React, { useState } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { IVOIRIAN_LOCATIONS } from '../data/initialData';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: { city: string; commune: string; quartier: string };
  onSelectLocation: (loc: { city: string; commune: string; quartier: string }) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [selectedCommune, setSelectedCommune] = useState(currentLocation.commune);

  if (!isOpen) return null;

  const activeCommuneData = IVOIRIAN_LOCATIONS.find(
    (l) => l.commune === selectedCommune
  ) || IVOIRIAN_LOCATIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Choisir ta zone locale
              </h3>
              <p className="text-xs text-slate-500">
                Filtre les informations par commune et quartier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Pilot Zone Highlight */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
              Zone pilote active
            </span>
            <p className="text-xs text-amber-900 mt-0.5">
              La première version de « Ça Bouge Ici » est déployée en priorité à{' '}
              <strong>Port-Bouët, Gonzagueville</strong> à Abidjan. Les autres
              communes sont accessibles pour l'extension progressive.
            </p>
          </div>

          {/* Communes selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              1. Choisis ta commune
            </label>
            <div className="grid grid-cols-2 gap-2">
              {IVOIRIAN_LOCATIONS.map((loc) => {
                const isCurrent = selectedCommune === loc.commune;
                const isPilot = loc.commune.includes('Port-Bouët');

                return (
                  <button
                    key={loc.commune}
                    onClick={() => setSelectedCommune(loc.commune)}
                    className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{loc.commune}</span>
                      {isPilot && (
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-bold ml-1">
                          Pilote
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {loc.city}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quartiers selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              2. Quartier dans {selectedCommune}
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeCommuneData.quartiers.map((q) => {
                const isChosen =
                  currentLocation.commune === selectedCommune &&
                  currentLocation.quartier === q;

                return (
                  <button
                    key={q}
                    onClick={() => {
                      onSelectLocation({
                        city: activeCommuneData.city,
                        commune: selectedCommune,
                        quartier: q,
                      });
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors border ${
                      isChosen
                        ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/60'
                    }`}
                  >
                    <span>{q}</span>
                    {isChosen && <Check className="w-4 h-4 text-amber-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
