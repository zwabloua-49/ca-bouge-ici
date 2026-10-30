import React from 'react';
import { MapPin, Wifi, WifiOff, ShieldCheck, LogIn } from 'lucide-react';
import { AppUser } from '../types';

interface NavbarProps {
  currentLocation: { city: string; commune: string; quartier: string };
  onOpenLocationModal: () => void;
  lowDataMode: boolean;
  onToggleLowDataMode: () => void;
  onOpenAdmin: () => void;
  currentUser: AppUser | null;
  onLogin: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onOpenLocationModal,
  lowDataMode,
  onToggleLowDataMode,
  onOpenAdmin,
  currentUser,
  onLogin,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-emerald-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-emerald-950 font-black text-lg shadow-sm">
            ÇB
          </div>
          <div className="leading-tight">
            <span className="font-bold text-base tracking-tight text-white block">
              Ça Bouge Ici
            </span>
            <span className="text-[10px] text-emerald-200 hidden sm:block tracking-wide">
              Le quotidien de ton quartier, en temps réel
            </span>
          </div>
        </div>

        {/* Zone 2: Location selector */}
        <button
          onClick={onOpenLocationModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-800 rounded-full text-xs font-medium text-emerald-100 transition-colors border border-emerald-700/60 max-w-[210px] truncate"
          title="Changer de quartier ou de commune"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            {currentLocation.quartier.includes('Tous')
              ? currentLocation.commune
              : currentLocation.quartier}
          </span>
          <span className="text-[10px] text-amber-300 font-semibold uppercase shrink-0">
            Changer
          </span>
        </button>

        {/* Zone 3: Quick Utilities (Low Data, Auth & Admin) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleLowDataMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              lowDataMode
                ? 'bg-amber-400 text-emerald-950 shadow-sm'
                : 'bg-emerald-800/80 text-emerald-200 hover:text-white border border-emerald-700/60'
            }`}
            title={
              lowDataMode
                ? 'Mode Éco Data activé (images allégées)'
                : 'Activer le mode Éco Data pour économiser votre forfait'
            }
          >
            {lowDataMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Éco Data</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden xs:inline text-[11px]">Data</span>
              </>
            )}
          </button>

          {/* User Auth Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-emerald-800 transition-colors"
              title={`Connecté : ${currentUser.displayName || currentUser.email}`}
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Utilisateur'}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-400"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-400 text-emerald-950 font-bold text-xs flex items-center justify-center ring-2 ring-emerald-700">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs rounded-full shadow-xs transition-colors"
              title="Se connecter avec Google pour participer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connexion</span>
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="p-1.5 rounded-full text-amber-300 hover:bg-emerald-800/60 transition-colors"
              title="Panneau d'administration & Modération"
              aria-label="Modération"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
