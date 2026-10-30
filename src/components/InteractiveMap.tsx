import React, { useState } from 'react';
import {
  Zap,
  Droplet,
  Car,
  AlertTriangle,
  Calendar,
  Tag,
  Info,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  X,
  Compass,
  Layers,
  Store,
} from 'lucide-react';
import { Business, Report, ReportCategory } from '../types';
import { REPORT_CATEGORIES, VERIFICATION_STATUSES } from '../utils/formatters';

interface InteractiveMapProps {
  reports: Report[];
  businesses: Business[];
  onVote: (id: string, type: 'confirm' | 'contest') => void;
  onOpenReportModal: () => void;
  activeQuartier: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  reports,
  businesses,
  onVote,
  onOpenReportModal,
  activeQuartier,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<{ type: 'report' | 'business'; data: Report | Business } | null>(null);
  const [mapTheme, setMapTheme] = useState<'street' | 'contrast'>('street');

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'commerce') return false;
    return r.category === selectedCategory;
  });

  // Filter businesses
  const showBusinesses = selectedCategory === 'all' || selectedCategory === 'commerce';

  const getPinIcon = (cat: ReportCategory) => {
    switch (cat) {
      case 'electricite':
        return <Zap className="w-3.5 h-3.5 text-amber-900" />;
      case 'eau':
        return <Droplet className="w-3.5 h-3.5 text-blue-900" />;
      case 'circulation':
        return <Car className="w-3.5 h-3.5 text-orange-900" />;
      case 'route':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-900" />;
      case 'evenement':
        return <Calendar className="w-3.5 h-3.5 text-emerald-900" />;
      case 'commerce_promo':
        return <Tag className="w-3.5 h-3.5 text-yellow-950" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-900" />;
    }
  };

  const getPinBg = (cat: ReportCategory) => {
    switch (cat) {
      case 'electricite':
        return 'bg-amber-400 border-amber-500';
      case 'eau':
        return 'bg-sky-400 border-sky-500';
      case 'circulation':
        return 'bg-orange-400 border-orange-500';
      case 'route':
        return 'bg-rose-400 border-rose-500';
      case 'evenement':
        return 'bg-emerald-400 border-emerald-500';
      case 'commerce_promo':
        return 'bg-yellow-400 border-yellow-500';
      default:
        return 'bg-slate-300 border-slate-400';
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] min-h-[500px] bg-slate-900 overflow-hidden select-none flex flex-col">
      {/* 1. Category Filter Floating Strip (Natural thumb reach or top) */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-amber-400 text-emerald-950 ring-2 ring-white'
              : 'bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white'
          }`}
        >
          Tous les repères ({reports.length + businesses.length})
        </button>

        <button
          onClick={() => setSelectedCategory('electricite')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md shrink-0 flex items-center gap-1 ${
            selectedCategory === 'electricite'
              ? 'bg-amber-500 text-white ring-2 ring-white'
              : 'bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Électricité (CIE)</span>
        </button>

        <button
          onClick={() => setSelectedCategory('eau')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md shrink-0 flex items-center gap-1 ${
            selectedCategory === 'eau'
              ? 'bg-blue-600 text-white ring-2 ring-white'
              : 'bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white'
          }`}
        >
          <Droplet className="w-3 h-3 text-blue-500" />
          <span>Eau (SODECI)</span>
        </button>

        <button
          onClick={() => setSelectedCategory('circulation')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md shrink-0 flex items-center gap-1 ${
            selectedCategory === 'circulation'
              ? 'bg-orange-600 text-white ring-2 ring-white'
              : 'bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white'
          }`}
        >
          <Car className="w-3 h-3 text-orange-500" />
          <span>Circulation</span>
        </button>

        <button
          onClick={() => setSelectedCategory('route')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md shrink-0 flex items-center gap-1 ${
            selectedCategory === 'route'
              ? 'bg-rose-600 text-white ring-2 ring-white'
              : 'bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          <span>Routes dégradées</span>
        </button>

        <button
          onClick={() => setSelectedCategory('commerce')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md shrink-0 flex items-center gap-1 ${
            selectedCategory === 'commerce'
              ? 'bg-emerald-700 text-white ring-2 ring-white'
              : 'bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white'
          }`}
        >
          <Store className="w-3 h-3 text-emerald-600" />
          <span>Commerces & Pharmacies</span>
        </button>
      </div>

      {/* 2. Map Visual Layer (SVG Stylized Map of Port-Bouët / Gonzagueville) */}
      <div className="relative w-full h-full flex-1 overflow-hidden">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={mapTheme === 'street' ? '#0284c7' : '#0369a1'} />
              <stop offset="100%" stopColor={mapTheme === 'street' ? '#0369a1' : '#075985'} />
            </linearGradient>

            <linearGradient id="lagoonGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={mapTheme === 'street' ? '#0891b2' : '#0e7490'} />
              <stop offset="100%" stopColor={mapTheme === 'street' ? '#06b6d4' : '#155e75'} />
            </linearGradient>

            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Landmass (Port-Bouët peninsula between ocean & lagoon) */}
          <rect width="1000" height="600" fill={mapTheme === 'street' ? '#1e293b' : '#0f172a'} />
          <rect width="1000" height="600" fill="url(#gridPattern)" />

          {/* Lagune Ébrié (North side) */}
          <path
            d="M 0,0 L 1000,0 L 1000,120 Q 800,90 600,140 T 250,110 Q 100,160 0,110 Z"
            fill="url(#lagoonGrad)"
            opacity="0.85"
          />
          <text x="620" y="70" fill="rgba(255,255,255,0.7)" fontSize="14" fontWeight="600" letterSpacing="2">
            LAGUNE ÉBRIÉ
          </text>

          {/* Océan Atlantique / Golfe de Guinée (South side) */}
          <path
            d="M 0,480 Q 200,460 450,490 T 800,470 Q 920,490 1000,480 L 1000,600 L 0,600 Z"
            fill="url(#oceanGrad)"
            opacity="0.9"
          />
          <text x="450" y="550" fill="rgba(255,255,255,0.7)" fontSize="15" fontWeight="700" letterSpacing="3">
            OCÉAN ATLANTIQUE (PLAGE DE GONZAGUEVILLE)
          </text>

          {/* Vridi Canal (West) */}
          <path d="M 120,110 Q 110,300 90,480" stroke="#0284c7" strokeWidth="26" fill="none" opacity="0.6" />
          <text x="30" y="320" fill="rgba(255,255,255,0.5)" fontSize="11" transform="rotate(-85 30 320)">
            Canal de Vridi
          </text>

          {/* Main Highway: Route de Grand-Bassam (A100) */}
          <path
            d="M 0,260 Q 250,280 500,270 T 800,280 L 1000,265"
            stroke="#f59e0b"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 0,260 Q 250,280 500,270 T 800,280 L 1000,265"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="10 10"
            fill="none"
          />

          {/* Secondary streets */}
          {/* Street: Axe Carrefour Terre Rouge */}
          <path d="M 380,130 L 380,480" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          {/* Street: Axe Carrefour Corail */}
          <path d="M 550,140 L 550,470" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
          {/* Street: Axe Anani */}
          <path d="M 780,110 L 780,470" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          {/* Street: Axe Phare / Vridi */}
          <path d="M 180,140 Q 200,320 220,470" stroke="#475569" strokeWidth="5" strokeLinecap="round" />

          {/* Area Labels (Culturally grounded) */}
          <text x="330" y="240" fill="#fcd34d" fontSize="13" fontWeight="bold">
            GONZAGUEVILLE
          </text>
          <text x="360" y="370" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="500">
            Terre Rouge
          </text>
          <text x="530" y="370" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="500">
            Carrefour Corail
          </text>
          <text x="760" y="370" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="500">
            Anani
          </text>
          <text x="170" y="380" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="500">
            Phare
          </text>
          <text x="250" y="210" fill="rgba(255,255,255,0.7)" fontSize="11">
            Derrière Wharf
          </text>
          <text x="80" y="200" fill="rgba(255,255,255,0.6)" fontSize="10">
            Vridi
          </text>

          {/* Highway label */}
          <rect x="580" y="245" width="230" height="20" rx="4" fill="#0f172a" fillOpacity="0.8" />
          <text x="590" y="259" fill="#fef08a" fontSize="11" fontWeight="bold">
            ROUTE DE GRAND-BASSAM (A100)
          </text>

          {/* Airport Zone hint */}
          <rect x="240" y="140" width="100" height="40" rx="6" fill="#334155" opacity="0.4" />
          <text x="250" y="165" fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="600">
            ✈ Aéroport FHB
          </text>
        </svg>

        {/* 3. HTML Interactive Pin Markers positioned via percentage */}
        {/* Reports Pins */}
        {filteredReports.map((r) => {
          const isSelected = selectedItem?.data.id === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedItem({ type: 'report', data: r })}
              style={{
                left: `${r.coordinates.xPercent}%`,
                top: `${r.coordinates.yPercent}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 focus:outline-none"
              title={`${r.title} - ${r.quartier}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform group-hover:scale-125 group-active:scale-95 ${getPinBg(
                  r.category
                )} ${isSelected ? 'ring-4 ring-white scale-125' : ''}`}
              >
                {getPinIcon(r.category)}
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {r.title}
              </span>
            </button>
          );
        })}

        {/* Businesses Pins */}
        {showBusinesses &&
          businesses.map((b) => {
            const isSelected = selectedItem?.data.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedItem({ type: 'business', data: b })}
                style={{
                  left: `${b.coordinates.xPercent}%`,
                  top: `${b.coordinates.yPercent}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 focus:outline-none"
                title={`${b.name} (${b.category})`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 border-emerald-400 bg-emerald-600 text-white shadow-lg transition-transform group-hover:scale-125 group-active:scale-95 ${
                    isSelected ? 'ring-4 ring-amber-300 scale-125' : ''
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-950/90 text-[10px] text-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {b.name}
                </span>
              </button>
            );
          })}

        {/* Map Controls on Top Right */}
        <div className="absolute top-14 right-3 z-20 flex flex-col gap-2">
          <button
            onClick={() => setMapTheme(mapTheme === 'street' ? 'contrast' : 'street')}
            className="p-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-xl shadow-md backdrop-blur-md"
            title="Changer le style de carte"
          >
            <Layers className="w-4 h-4" />
          </button>
          <div className="p-2.5 bg-white/90 text-emerald-800 rounded-xl shadow-md backdrop-blur-md flex items-center justify-center">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
        </div>

        {/* Floating Add Report CTA Button on Map */}
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs rounded-full shadow-xl flex items-center gap-2 border-2 border-white active:scale-95 transition-transform"
          >
            <MapPin className="w-4 h-4 text-emerald-900" />
            <span>Signaler ici</span>
          </button>
        </div>
      </div>

      {/* 4. Selected Pin Detail Bottom Drawer */}
      {selectedItem && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl p-4 sm:p-5 border-t border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[50vh] overflow-y-auto">
          <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />

          {selectedItem.type === 'report' ? (
            (() => {
              const rep = selectedItem.data as Report;
              const catMeta = REPORT_CATEGORIES[rep.category] || REPORT_CATEGORIES.autre;
              const stMeta = VERIFICATION_STATUSES[rep.status] || VERIFICATION_STATUSES.non_verifie;

              return (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-800">{catMeta.shortLabel}</span>
                        <span>·</span>
                        <span>{rep.quartier}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{rep.title}</h4>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">{rep.description}</p>

                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl text-xs text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      <strong>Repère :</strong> {rep.landmark}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${stMeta.badgeBg} ${stMeta.badgeText}`}>
                      {stMeta.label}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onVote(rep.id, 'confirm')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          rep.userVote === 'confirm'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Confirmer ({rep.confirmationsCount})</span>
                      </button>

                      <button
                        onClick={() => onVote(rep.id, 'contest')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                          rep.userVote === 'contest'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Contester ({rep.contestationsCount})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            (() => {
              const b = selectedItem.data as Business;
              return (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                        Commerce & Service vérifié
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{b.name}</h4>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">{b.description}</p>

                  <div className="bg-slate-50 p-2 rounded-xl text-xs text-slate-700">
                    <span className="font-semibold">Horaires déclarés :</span> {b.declaredHours}
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {b.verificationNote}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${b.phone}`}
                      className="flex-1 py-2 text-center text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
                    >
                      Appeler ({b.phone})
                    </a>
                    {b.whatsapp && (
                      <a
                        href={`https://wa.me/${b.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 text-center text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-500 rounded-xl"
                      >
                        WhatsApp direct
                      </a>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
