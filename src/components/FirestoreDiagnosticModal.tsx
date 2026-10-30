import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Loader2,
  ExternalLink,
  LogIn,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { collection, doc, getDocFromServer, getDocs, limit, query, setDoc } from 'firebase/firestore';
import { db, auth, loginWithGoogle } from '../services/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppUser } from '../types';

interface FirestoreDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onSuccess?: () => void;
}

interface StepResult {
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  title: string;
  details: string;
  code?: string;
}

export const FirestoreDiagnosticModal: React.FC<FirestoreDiagnosticModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [step1, setStep1] = useState<StepResult>({
    status: 'pending',
    title: '1. Configuration du projet Firebase',
    details: 'Vérification de firebase-applet-config.json...',
  });
  const [step2, setStep2] = useState<StepResult>({
    status: 'pending',
    title: '2. Connectivité Cloud Firestore (Lecture)',
    details: 'Test de réponse de la base ai-studio-abougeici-...',
  });
  const [step3, setStep3] = useState<StepResult>({
    status: 'pending',
    title: '3. Autorisation et Authentification',
    details: 'Vérification du compte utilisateur pour respecter les règles de sécurité.',
  });
  const [step4, setStep4] = useState<StepResult>({
    status: 'pending',
    title: '4. Test d’écriture puis de lecture dans « publications »',
    details: 'Création du document test-diagnostic-connexion et relecture.',
  });

  if (!isOpen) return null;

  const runDiagnostics = async () => {
    setIsRunning(true);

    // --- STEP 1: Configuration ---
    setStep1({
      status: 'running',
      title: '1. Configuration du projet Firebase',
      details: 'Lecture des identifiants...',
    });
    await new Promise((r) => setTimeout(r, 300));

    const projectId = firebaseConfig.projectId;
    const databaseId = firebaseConfig.firestoreDatabaseId;

    if (!projectId || !databaseId) {
      setStep1({
        status: 'error',
        title: '1. Configuration du projet Firebase',
        details: 'Identifiants Firebase manquants dans firebase-applet-config.json.',
      });
      setIsRunning(false);
      return;
    }

    setStep1({
      status: 'success',
      title: '1. Configuration du projet Firebase',
      details: `Projet : "${projectId}" | Base dédiée : "${databaseId}" (initialisée correctement).`,
    });

    // --- STEP 2: Connectivity probe ---
    setStep2({
      status: 'running',
      title: '2. Connectivité Cloud Firestore (Lecture)',
      details: `Envoi d’une requête de lecture sur la collection "publications"...`,
    });

    try {
      const q = query(collection(db, 'publications'), limit(1));
      let snap;
      try {
        snap = await getDocs(q);
      } catch (initialErr: unknown) {
        const initialMsg = initialErr instanceof Error ? initialErr.message : String(initialErr);
        if (
          initialMsg.includes('token-service-api') ||
          initialMsg.includes('securetoken.googleapis.com') ||
          initialMsg.includes('Fetching auth token failed')
        ) {
          console.warn('[Diagnostic] Token STS error detected, clearing stale auth session...');
          await auth.signOut().catch(() => {});
          // Retry getDocs with clean unauthenticated state
          snap = await getDocs(q);
        } else {
          throw initialErr;
        }
      }

      setStep2({
        status: 'success',
        title: '2. Connectivité Cloud Firestore (Lecture)',
        details: `Connexion active et serveur accessible en lecture. Documents existants dans publications : ${snap.size}.`,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errorCode = (err as { code?: string })?.code || 'inconnu';
      const isTokenApiError = errorMsg.includes('token-service-api') || errorMsg.includes('securetoken.googleapis.com');
      
      setStep2({
        status: 'error',
        title: '2. Connectivité Cloud Firestore (Lecture)',
        details: isTokenApiError
          ? `L'API Token Service (securetoken.googleapis.com) est désactivée sur votre projet Google Cloud 972687729437. Cliquez sur le lien pour l'activer gratuitement.`
          : `Échec de communication avec Firestore. Code : [${errorCode}] - ${errorMsg}`,
        code: errorCode,
      });
      setIsRunning(false);
      return;
    }

    // --- STEP 3: Authentication & Security Rules Check ---
    setStep3({
      status: 'running',
      title: '3. Autorisation et Authentification',
      details: 'Vérification de l’état auth...',
    });
    await new Promise((r) => setTimeout(r, 200));

    const activeAuthUser = auth.currentUser;
    if (!activeAuthUser) {
      setStep3({
        status: 'warning',
        title: '3. Autorisation et Authentification',
        details: `Aucun utilisateur n'est connecté. Selon les règles de sécurité Firestore en vigueur, l'écriture dans "publications" est protégée et requiert une authentification (isSignedIn()) pour empêcher les spams.`,
      });
      setStep4({
        status: 'warning',
        title: '4. Test d’écriture puis de lecture dans « publications »',
        details: `Veuillez vous connecter avec votre compte Google ci-dessous pour exécuter le test d'écriture.`,
      });
      setIsRunning(false);
      return;
    }

    setStep3({
      status: 'success',
      title: '3. Autorisation et Authentification',
      details: `Utilisateur authentifié : ${activeAuthUser.displayName || activeAuthUser.email} (UID: ${activeAuthUser.uid.slice(0, 10)}...). Les règles autorisent l'écriture.`,
    });

    // --- STEP 4: Real Write and Read Test ---
    setStep4({
      status: 'running',
      title: '4. Test d’écriture puis de lecture dans « publications »',
      details: 'Écriture du document "test-diagnostic-connexion" dans Firestore...',
    });

    const testDocId = 'test-diagnostic-connexion';
    const startTime = Date.now();

    try {
      const testPayload = {
        title: "Test de vérification de connexion Firestore",
        description: "Document de diagnostic généré pour certifier l'existence et la création de la collection publications.",
        category: "autre",
        status: "non_verifie",
        city: "Abidjan",
        commune: "Port-Bouët (Zone pilote)",
        quartier: "Gonzagueville (Terre Rouge)",
        landmark: "Repère test diagnostic",
        authorId: activeAuthUser.uid,
        authorName: activeAuthUser.displayName || "Testeur Vérifié",
        createdAt: new Date().toISOString(),
        confirmationsCount: 1,
        contestationsCount: 0,
        confirmedBy: [activeAuthUser.uid],
        contestedBy: [],
        abuseReportsCount: 0,
        isDemo: true,
      };

      // 1. Écriture
      await setDoc(doc(db, 'publications', testDocId), testPayload);

      // 2. Relecture immédiate depuis le serveur
      const readSnap = await getDocFromServer(doc(db, 'publications', testDocId));
      const durationMs = Date.now() - startTime;

      if (readSnap.exists()) {
        setStep4({
          status: 'success',
          title: '4. Test d’écriture puis de lecture dans « publications »',
          details: `Écriture et relecture réussies avec succès en ${durationMs} ms ! Le document "${testDocId}" est maintenant enregistré dans votre collection Firestore.`,
        });
        onSuccess?.();
      } else {
        setStep4({
          status: 'warning',
          title: '4. Test d’écriture puis de lecture dans « publications »',
          details: `Écriture acceptée mais le document n'a pas pu être relu immédiatement depuis le serveur.`,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errorCode = (err as { code?: string })?.code || 'inconnu';
      setStep4({
        status: 'error',
        title: '4. Test d’écriture puis de lecture dans « publications »',
        details: `Erreur Firebase lors de l'écriture : [${errorCode}] - ${errorMsg}`,
        code: errorCode,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: StepResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Diagnostic en direct Cloud Firestore
              </h3>
              <p className="text-[11px] text-slate-300">
                Vérification sans frais · Projet {firebaseConfig.projectId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Zero-cost Free Tier Reassurance */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block">Développement 100% gratuit (Sans offre payante)</strong>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Le message de quota partagé affiché dans Firestore correspond à la formule gratuite
                Spark. Aucun passage à une offre payante n'est nécessaire pour développer et utiliser
                l'application à Gonzagueville.
              </p>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-2.5">
            {[step1, step2, step3, step4].map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  step.status === 'success'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : step.status === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : step.status === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getStepIcon(step.status)}
                  <span className="font-bold text-xs">{step.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
                  {step.details}
                </p>
                {step.code && (
                  <span className="inline-block mt-1 ml-6 px-1.5 py-0.5 bg-rose-100 text-rose-800 font-mono text-[10px] rounded">
                    Code : {step.code}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Auth trigger if step 3 warns */}
          {!currentUser && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
              <div className="text-[11px] text-amber-950">
                <span className="font-bold block">Connectez-vous pour autoriser l'écriture</span>
                <span>Les règles de sécurité Firestore exigent un utilisateur pour créer des documents.</span>
              </div>
              <button
                onClick={loginWithGoogle}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </button>
            </div>
          )}

          {/* Console Link notice */}
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-slate-700" />
              Lien direct vers votre base Cloud Firestore :
            </span>
            <p className="text-[11px] text-slate-600">
              Dans la console Firebase, assurez-vous de sélectionner la base{' '}
              <code className="font-mono bg-white px-1 py-0.5 rounded text-emerald-900 border border-slate-200 font-bold">
                {firebaseConfig.firestoreDatabaseId}
              </code>{' '}
              et non la base par défaut <code>(default)</code>.
            </p>
            <div className="pt-1">
              <a
                href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>Accéder directement aux documents dans la Console Firebase</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Token Service API notice if needed */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-[11px] text-blue-950">
            <span className="font-bold flex items-center gap-1 text-blue-900">
              <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
              API Token Service (Authentification Google) :
            </span>
            <p className="text-slate-600">
              Si la connexion Google signale que l'API Token Service n'est pas activée sur le projet {firebaseConfig.projectId}, vous pouvez l'activer gratuitement en 1 clic dans Google Cloud Console :
            </p>
            <a
              href="https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=972687729437"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-blue-800 hover:underline flex items-center gap-1 pt-0.5"
            >
              <span>Activer l'API Token Service (Projet 972687729437)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Fermer
          </button>

          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Diagnostic en cours...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-amber-300" />
                <span>Lancer le diagnostic & Test d'écriture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
