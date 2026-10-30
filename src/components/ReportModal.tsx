import React, { useState } from 'react';
import {
  X,
  Zap,
  Droplet,
  Car,
  AlertTriangle,
  Calendar,
  Tag,
  Info,
  Camera,
  MapPin,
  CheckCircle2,
  Trash2,
  HeartHandshake,
  LogIn,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { AppUser, Coordinates, ReportCategory } from '../types';
import { IVOIRIAN_LOCATIONS } from '../data/initialData';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (data: {
    title: string;
    description: string;
    category: ReportCategory;
    createdAt?: string;
    city: string;
    commune: string;
    quartier: string;
    landmark: string;
    authorName: string;
    imageUrl?: string;
    coordinates: Coordinates;
  }) => Promise<void> | void;
  defaultLocation: { city: string; commune: string; quartier: string };
  currentUser: AppUser | null;
  onLogin: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  defaultLocation,
  currentUser,
  onLogin,
}) => {
  const [category, setCategory] = useState<ReportCategory>('electricite');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Date of event / report
  const [reportDate, setReportDate] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [commune, setCommune] = useState(defaultLocation.commune);
  const [quartier, setQuartier] = useState(
    defaultLocation.quartier.includes('Tous')
      ? 'Gonzagueville (Terre Rouge)'
      : defaultLocation.quartier
  );
  const [landmark, setLandmark] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.displayName || '');
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const categories: { id: ReportCategory; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'electricite', label: 'Électricité (CIE)', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-300' },
    { id: 'eau', label: 'Eau (SODECI)', icon: Droplet, color: 'text-blue-600 bg-blue-50 border-blue-300' },
    { id: 'circulation', label: 'Circulation & Trafic', icon: Car, color: 'text-orange-600 bg-orange-50 border-orange-300' },
    { id: 'route', label: 'Route dégradée', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-300' },
    { id: 'evenement', label: 'Événement local', icon: Calendar, color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
    { id: 'entraide', label: 'Entraide & Voisins', icon: HeartHandshake, color: 'text-indigo-600 bg-indigo-50 border-indigo-300' },
    { id: 'commerce_promo', label: 'Commerce / Promo', icon: Tag, color: 'text-yellow-700 bg-yellow-50 border-yellow-300' },
    { id: 'autre', label: 'Autre info utile', icon: Info, color: 'text-slate-600 bg-slate-50 border-slate-300' },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentCommuneData =
    IVOIRIAN_LOCATIONS.find((l) => l.commune === commune) || IVOIRIAN_LOCATIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !description.trim()) {
      setErrorMessage("Veuillez remplir au minimum le titre et la description.");
      return;
    }

    if (!currentUser) {
      setErrorMessage("Connexion requise : Veuillez vous connecter avec votre compte pour enregistrer cette publication dans la collection 'publications' de Cloud Firestore.");
      return;
    }

    const coords: Coordinates = {
      lat: 5.24 + Math.random() * 0.02 - 0.01,
      lng: -3.89 + Math.random() * 0.02 - 0.01,
      xPercent: 30 + Math.floor(Math.random() * 50),
      yPercent: 30 + Math.floor(Math.random() * 45),
    };

    setIsSubmitting(true);

    try {
      await onSubmitReport({
        title: title.trim(),
        description: description.trim(),
        category,
        createdAt: reportDate ? new Date(reportDate).toISOString() : new Date().toISOString(),
        city: currentCommuneData.city,
        commune,
        quartier,
        landmark: landmark.trim() || 'Gonzagueville',
        authorName: (currentUser?.displayName || authorName.trim()) || 'Résident de Gonzagueville',
        imageUrl: imagePreview,
        coordinates: coords,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setTitle('');
        setDescription('');
        setLandmark('');
        setImagePreview(undefined);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error("Erreur enregistrement publication :", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Échec de l'enregistrement dans Cloud Firestore. Vérifiez votre connexion."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="font-bold text-base tracking-tight">
              Nouvelle publication locale
            </h2>
            <p className="text-xs text-emerald-200">
              Enregistrée dans la collection Firestore « publications »
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-800 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Publication enregistrée dans Firestore !
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Votre publication a été insérée dans la collection <strong>publications</strong> et
              la liste des actualités de <strong>{quartier}</strong> a été actualisée instantanément.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Impossible d'enregistrer la publication</span>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Non-authenticated banner notice */}
            {!currentUser && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="text-xs text-amber-950">
                  <span className="font-bold block">Connexion obligatoire</span>
                  <span className="text-[11px] text-amber-800">
                    Les règles de sécurité Firestore exigent un compte pour publier.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogin}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Se connecter</span>
                </button>
              </div>
            )}

            {/* 1. Category Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                1. Catégorie de la publication <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        isSelected
                          ? `${cat.color} ring-2 ring-emerald-600 shadow-xs font-bold`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                2. Titre de la publication <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Coupure de courant secteur Corail depuis 15h"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>

            {/* 3. Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                3. Description détaillée <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décris précisément ce qui se passe ou ton message pour le quartier..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none resize-none"
              />
            </div>

            {/* 4. Date selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>4. Date & Heure du constat ou de l'événement</span>
              </label>
              <input
                type="datetime-local"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none bg-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                La date sera enregistrée dans le document Firestore pour le tri chronologique.
              </span>
            </div>

            {/* 5. Commune & Quartier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Commune
                </label>
                <select
                  value={commune}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCommune(c);
                    const targetData = IVOIRIAN_LOCATIONS.find((l) => l.commune === c);
                    if (targetData && targetData.quartiers.length > 0) {
                      setQuartier(targetData.quartiers[1] || targetData.quartiers[0]);
                    }
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 outline-none"
                >
                  {IVOIRIAN_LOCATIONS.map((loc) => (
                    <option key={loc.commune} value={loc.commune}>
                      {loc.commune} ({loc.city})
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
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 outline-none"
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

            {/* 6. Landmark (Repère) */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between mb-1">
                <span>6. Repère d'accès local</span>
                <span className="text-[10px] text-amber-700 font-medium">
                  Essentiel à Abidjan
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Ex : Face à la pharmacie Corail, à 50m du carrefour Terre Rouge"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
                <MapPin className="w-4 h-4 text-emerald-700 absolute left-3 top-3" />
              </div>
            </div>

            {/* 7. Photo upload */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                7. Photo jointe (facultative)
              </label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-100">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(undefined)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg shadow-sm"
                    title="Supprimer la photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/80">
                  <Camera className="w-6 h-6 text-emerald-700 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    Ajouter une photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-2 py-3 px-4 text-xs sm:text-sm font-bold text-emerald-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-950" />
                    <span>Enregistrement Firestore...</span>
                  </>
                ) : (
                  <span>Enregistrer la publication</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
