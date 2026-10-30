import React, { useState } from 'react';
import { X, Store, CheckCircle2, Phone, MessageSquare, MapPin } from 'lucide-react';
import { BusinessCategory, Coordinates } from '../types';
import { BUSINESS_CATEGORIES } from '../utils/formatters';
import { IVOIRIAN_LOCATIONS } from '../data/initialData';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBusiness: (data: {
    name: string;
    category: BusinessCategory;
    description: string;
    city: string;
    commune: string;
    quartier: string;
    landmark: string;
    declaredHours: string;
    phone: string;
    whatsapp?: string;
    tags: string[];
    coordinates: Coordinates;
  }) => void;
  defaultLocation: { city: string; commune: string; quartier: string };
}

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({
  isOpen,
  onClose,
  onSubmitBusiness,
  defaultLocation,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('maquis');
  const [description, setDescription] = useState('');
  const [commune, setCommune] = useState(defaultLocation.commune);
  const [quartier, setQuartier] = useState(
    defaultLocation.quartier.includes('Tous')
      ? 'Gonzagueville (Terre Rouge)'
      : defaultLocation.quartier
  );
  const [landmark, setLandmark] = useState('');
  const [declaredHours, setDeclaredHours] = useState('08h00 - 20h00 (Lundi au Samedi)');
  const [phone, setPhone] = useState('+225 ');
  const [whatsapp, setWhatsapp] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentCommuneData =
    IVOIRIAN_LOCATIONS.find((l) => l.commune === commune) || IVOIRIAN_LOCATIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !landmark.trim() || !phone.trim()) return;

    const tags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [category];

    const coords: Coordinates = {
      lat: 5.24 + Math.random() * 0.015,
      lng: -3.89 + Math.random() * 0.015,
      xPercent: 35 + Math.floor(Math.random() * 45),
      yPercent: 35 + Math.floor(Math.random() * 35),
    };

    onSubmitBusiness({
      name: name.trim(),
      category,
      description: description.trim() || 'Commerce & service de proximité vérifié localement.',
      city: currentCommuneData.city,
      commune,
      quartier,
      landmark: landmark.trim(),
      declaredHours: declaredHours.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      tags,
      coordinates: coords,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm">Ajouter un commerce ou service</h3>
              <p className="text-[11px] text-emerald-200">
                Fais connaître ton activité aux habitants de {commune}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white rounded-full"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Commerce ajouté à l'annuaire !</h4>
            <p className="text-xs text-slate-600">
              Votre fiche est maintenant accessible pour les résidents du quartier.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Nom du commerce ou du service <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Maquis Chez Tantie, Pharmacie de Gonzagueville..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 outline-none"
              >
                {Object.entries(BUSINESS_CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Commune
                </label>
                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                >
                  {IVOIRIAN_LOCATIONS.map((loc) => (
                    <option key={loc.commune} value={loc.commune}>
                      {loc.commune}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Quartier
                </label>
                <select
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                >
                  {currentCommuneData.quartiers
                    .filter((q) => !q.includes('Tous les'))
                    .map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Repère d'accès précis <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Ex : Carrefour Corail, à 30m de la station"
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                />
                <MapPin className="w-3.5 h-3.5 text-emerald-700 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Horaires d'ouverture déclarés
              </label>
              <input
                type="text"
                value={declaredHours}
                onChange={(e) => setDeclaredHours(e.target.value)}
                placeholder="Ex : 07h30 - 21h00 (7j/7)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Règle de transparence : les clients seront informés qu'il s'agit d'horaires déclarés.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Téléphone direct <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+225 07..."
                    className="w-full text-xs pl-7 pr-2 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                  <Phone className="w-3 h-3 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Numéro WhatsApp
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="22507000000"
                    className="w-full text-xs pl-7 pr-2 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                  <MessageSquare className="w-3 h-3 text-emerald-600 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Description & Spécialités
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex : Poisson braisé, jus naturels, vente de ciment, dépannage express..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Mots-clés de recherche (séparés par virgules)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ex : Wave, Orange Money, Attiéké, Climatisation"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
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
                className="flex-1 py-2.5 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs"
              >
                Enregistrer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
