import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Cross,
  Utensils,
  ShoppingBag,
  Smartphone,
  Wrench,
  Store,
} from 'lucide-react';
import { Business, BusinessCategory } from '../types';
import { BUSINESS_CATEGORIES } from '../utils/formatters';

interface BusinessDirectoryProps {
  businesses: Business[];
  onOpenAddModal: () => void;
  activeCommune: string;
  activeQuartier: string;
  lowDataMode: boolean;
}

export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({
  businesses,
  onOpenAddModal,
  activeCommune,
  activeQuartier,
  lowDataMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBusinesses = businesses.filter((b) => {
    // Location filter if specific quartier chosen
    if (
      !activeQuartier.includes('Tous') &&
      b.commune === activeCommune &&
      b.quartier !== activeQuartier
    ) {
      // Allow neighborhood flexibility or match
    }

    // Category filter
    if (selectedCategory !== 'all' && b.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchDesc = b.description.toLowerCase().includes(q);
      const matchLandmark = b.landmark.toLowerCase().includes(q);
      const matchTag = b.tags?.some((t) => t.toLowerCase().includes(q));
      return matchName || matchDesc || matchLandmark || matchTag;
    }

    return true;
  });

  const getCategoryIcon = (cat: BusinessCategory) => {
    switch (cat) {
      case 'pharmacie':
        return <Cross className="w-4 h-4 text-emerald-600" />;
      case 'maquis':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'superette':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'services':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      case 'artisanat':
        return <Wrench className="w-4 h-4 text-orange-600" />;
      default:
        return <Store className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Banner & Action */}
      <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
            Annuaire de proximité
          </span>
          <h2 className="text-lg font-bold">Commerces & Services locaux</h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            Pharmacies de garde, maquis, dépôts Wave/Orange Money et artisans à{' '}
            <strong>{activeCommune}</strong>.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter mon commerce</span>
        </button>
      </div>

      {/* 2. Search & Transparency Banner */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, service (ex: Wave, alloco, pharmacie)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Strict Transparency Notice (Adheres to user constraint: don't state open without recent info) */}
        <div className="flex items-start gap-2 bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-xl text-[11px] text-amber-950">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Transparence & Exactitude :</strong> Les horaires affichés sont
            les horaires déclarés par les commerçants ou confirmés par les habitants.
            Appelez ou écrivez sur WhatsApp avant de vous déplacer.
          </p>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            selectedCategory === 'all'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Tous ({businesses.length})
        </button>

        {Object.entries(BUSINESS_CATEGORIES).map(([catId, val]) => {
          const isSelected = selectedCategory === catId;
          const count = businesses.filter((b) => b.category === catId).length;

          return (
            <button
              key={catId}
              onClick={() => setSelectedCategory(catId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{val.label}</span>
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

      {/* 4. Businesses List / Grid */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Store className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">
            Aucun commerce trouvé dans cette sélection
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vous connaissez un commerce ou vous êtes commerçant à {activeCommune} ?
            Soyez le premier à ajouter votre établissement !
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800"
          >
            Ajouter ce commerce
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredBusinesses.map((biz) => {
            const hasImage = biz.imageUrl && !lowDataMode;

            return (
              <article
                key={biz.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between gap-3"
              >
                {/* Header & Category info */}
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                        {getCategoryIcon(biz.category)}
                      </div>
                      <span className="font-semibold text-slate-800">
                        {BUSINESS_CATEGORIES[biz.category]?.label || biz.category}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-600">{biz.quartier}</span>
                    </div>

                    {biz.isOnDuty && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        De garde
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {biz.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {biz.description}
                  </p>
                </div>

                {/* Optional Image */}
                {hasImage && (
                  <div className="relative rounded-xl overflow-hidden aspect-16/9 bg-slate-100 border border-slate-200">
                    <img
                      src={biz.imageUrl}
                      alt={biz.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Local Landmark & Declared Hours */}
                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Repère :</strong> {biz.landmark}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">Horaires : </span>
                      <span>{biz.declaredHours}</span>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {biz.verificationNote} ({biz.lastVerifiedDate})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {biz.tags && biz.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                    {biz.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions: Call & WhatsApp */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`tel:${biz.phone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="truncate">Appeler ({biz.phone})</span>
                  </a>

                  {biz.whatsapp && (
                    <a
                      href={`https://wa.me/${biz.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors min-h-[40px] shrink-0"
                      title="Envoyer un message WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
