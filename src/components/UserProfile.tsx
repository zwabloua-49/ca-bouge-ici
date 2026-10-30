import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  WifiOff,
  PhoneCall,
  MapPin,
  LogIn,
  LogOut,
  Database,
  CheckCircle2,
  Info,
  Server,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { AdminModeration } from './AdminModeration';
import { AppUser, Report } from '../types';
import { loginWithGoogle, logoutUser } from '../services/firebase';

interface UserProfileProps {
  currentLocation: { city: string; commune: string; quartier: string };
  onOpenLocationModal: () => void;
  lowDataMode: boolean;
  onToggleLowDataMode: () => void;
  reports: Report[];
  onUpdateReports: (reports: Report[]) => void;
  onResetData: () => void;
  currentUser: AppUser | null;
  onUserChange?: (user: AppUser | null) => void;
  onOpenDiagnostic?: () => void;
  onOpenAndroidBuild?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentLocation,
  onOpenLocationModal,
  lowDataMode,
  onToggleLowDataMode,
  reports,
  onUpdateReports,
  onResetData,
  currentUser,
  onOpenDiagnostic,
  onOpenAndroidBuild,
}) => {
  const [isAdminView, setIsAdminView] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const handleLogin = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      setAuthError("Connexion annulée ou fermée. Réessayez.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
  };

  const emergencyContacts = [
    { name: 'CIE Dépannage Électricité', number: '179', desc: 'Signaler un câble tombé ou transformateur' },
    { name: 'SODECI Urgences Fuites & Coupures', number: '175', desc: 'Rupture de canalisation ou coupure' },
    { name: 'Sapeurs-Pompiers Militaires (GSPM)', number: '180', desc: 'Accident, incendie ou secours' },
    { name: 'SAMU Urgences Médicales', number: '185', desc: 'Urgences vitales' },
    { name: 'Police Secours Port-Bouët', number: '170', desc: 'Sécurité et circulation' },
  ];

  if (isAdminView) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setIsAdminView(false)}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 py-1 px-2 rounded-lg bg-emerald-50 w-fit"
        >
          ← Retour à mon profil
        </button>
        <AdminModeration
          reports={reports}
          onUpdateReports={onUpdateReports}
          onResetData={onResetData}
          activeCommune={currentLocation.commune}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Profile & Authentication Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        {currentUser ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Photo'}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-600 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border-2 border-emerald-600 font-black text-xl">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    {currentUser.displayName || 'Résident'}
                  </h2>
                  {currentUser.role === 'admin' && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                      Administrateur
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{currentLocation.quartier}</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Compte certifié
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Connexion sécurisée
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Rejoignez la communauté de votre quartier
              </h2>
              <p className="text-xs text-slate-600 max-w-md">
                Connectez-vous pour publier des signalements, certifier les alertes de vos voisins
                et enregistrer vos préférences de manière durable.
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoadingAuth}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 shrink-0"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>{isLoadingAuth ? 'Connexion en cours...' : 'Se connecter avec Google'}</span>
            </button>
          </div>
        )}

        {authError && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
            {authError}
          </div>
        )}
      </div>

      {/* 2. Cloud Firestore & Realtime Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Base de données Cloud Firestore active
              </h3>
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Synchronisation temps réel activée (Port-Bouët & Abidjan)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 hidden sm:inline-block">
            Projet : encouraging-bonito-wlxdt
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
          Vos publications, confirmations citoyennes et commerces locaux sont désormais
          enregistrés durablement dans <strong>Google Cloud Firestore</strong> avec des
          règles de sécurité empêchant toute modification non autorisée.
        </p>

        {onOpenDiagnostic && (
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Vérifier la connectivité, les règles et exécuter un test d'écriture sans frais :
            </span>
            <button
              onClick={onOpenDiagnostic}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-amber-300" />
              <span>Diagnostic & Test Firestore</span>
            </button>
          </div>
        )}
      </div>

      {/* 2.bis Android APK Native Application (Method 2 GitHub Actions) */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full">
                  Application Native Android
                </span>
                <span className="text-xs text-emerald-200">Package : ci.cabougeici.app</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                Générer & Télécharger le fichier APK
              </h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed mt-0.5">
                Le pipeline GitHub Actions gratuit (Ubuntu + Java 17 + Gradle) est configuré et prêt à compiler votre fichier <code>.apk</code> en 2 minutes.
              </p>
            </div>
          </div>
        </div>

        {onOpenAndroidBuild && (
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-emerald-800/80">
            <span className="text-[11px] text-emerald-200">
              Compilation Cloud gratuite via GitHub Actions :
            </span>
            <button
              onClick={onOpenAndroidBuild}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0"
            >
              <Smartphone className="w-4 h-4 text-emerald-950" />
              <span>Générer l'APK via GitHub Actions ›</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Preferences & Low Data Mode */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Préférences & Économie d'Internet
        </h3>

        {/* Low Data Mode Toggle */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-start gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Mode Éco Data (Connexion lente)
              </span>
              <p className="text-[11px] text-slate-500 leading-tight">
                Allège l'application en masquant les photos lourdes pour économiser vos Mo de forfait internet mobile.
              </p>
            </div>
          </div>
          <button
            onClick={onToggleLowDataMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              lowDataMode ? 'bg-amber-400' : 'bg-slate-300'
            }`}
            aria-label="Basculer le mode Éco Data"
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                lowDataMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Change Neighborhood */}
        <button
          onClick={onOpenLocationModal}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Changer mon quartier par défaut</span>
          </div>
          <span className="text-emerald-800 font-bold">
            {currentLocation.commune} ›
          </span>
        </button>
      </div>

      {/* 4. Administration Access */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Espace Modération & Gestion
            </h3>
            <p className="text-[11px] text-slate-500">
              Modérer les publications suspectes et superviser les signalements
            </p>
          </div>
          <button
            onClick={() => setIsAdminView(true)}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Ouvrir l'administration</span>
          </button>
        </div>
      </div>

      {/* 5. Emergency Contacts in CI */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-rose-700">
          <PhoneCall className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Numéros d'urgence utiles (Côte d'Ivoire)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.name}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {contact.name}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {contact.desc}
                </span>
              </div>
              <a
                href={`tel:${contact.number}`}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs rounded-lg shadow-2xs shrink-0"
              >
                {contact.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Protection of Personal Data */}
      <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-4 text-xs text-emerald-950 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>Protection des données personnelles & Sécurité</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Les règles de sécurité Firestore déployées garantissent que nul ne peut usurper votre
          identité ni modifier ou supprimer vos publications sans votre autorisation. Vos informations
          personnelles et coordonnées ne sont jamais vendues ni cédées.
        </p>
      </div>
    </div>
  );
};
