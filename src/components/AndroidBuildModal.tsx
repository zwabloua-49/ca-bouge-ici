import React, { useState } from 'react';
import {
  Smartphone,
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  Github,
  Terminal,
  Download,
  AlertCircle,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AndroidBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidBuildModal: React.FC<AndroidBuildModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [repoUrlInput, setRepoUrlInput] = useState('https://github.com/zwabloua-49/ca-bouge-ici.git');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2500);
  };

  const dynamicGitCommands = repoUrlInput.trim()
    ? `git remote set-url origin ${repoUrlInput.trim()} 2>/dev/null || git remote add origin ${repoUrlInput.trim()}\ngit branch -M main\ngit push -u origin main`
    : `git remote add origin https://github.com/zwabloua-49/ca-bouge-ici.git\ngit branch -M main\ngit push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="android-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full">
                    Méthode 2 · 100% Gratuite
                  </span>
                  <span className="text-xs text-emerald-200 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" /> Pipeline prêt
                  </span>
                </div>
                <h2 id="android-modal-title" className="text-lg sm:text-xl font-black mt-1 text-white">
                  Générer l'APK Android (Ça Bouge Ici)
                </h2>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  Compilation Cloud via GitHub Actions (Ubuntu + Zulu JDK 17 + Gradle)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
              aria-label="Fermer la fenêtre"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          {/* User Account Detected Banner */}
          <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-xs flex items-center gap-2">
                <Github className="w-4 h-4 text-emerald-800" />
                Compte GitHub cible : <strong>@zwabloua-49</strong>
              </span>
              <span className="text-[10px] font-medium text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                zwabloua@gmail.com
              </span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Pour des règles strictes de sécurité et de protection de la vie privée imposées par GitHub, un service externe ne peut pas se connecter ou créer de dépôt sur votre compte privé sans votre accord. 
              <strong> Tout a donc été pré-configuré pour que vous n'ayez qu'à cliquer sur un bouton !</strong>
            </p>
          </div>

          {/* Status summary banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-700" />
                Vérifications & Prérequis complétés par l'ingénieur :
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                ci.cabougeici.app
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Capacitor 8 natif synchronisé</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Workflow GitHub Actions configuré</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Dépôt Git initialisé sur branche <code>main</code></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Base Firestore & Auth préservées</span>
              </div>
            </div>
          </div>

          {/* Stepper Guide */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Étape 1 : Créer le dépôt pré-rempli en 1 clic</span>
            </h3>

            <div className="pl-7 space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Cliquez sur ce lien direct : le formulaire s'ouvre avec le nom <strong>ca-bouge-ici</strong> déjà renseigné !
              </p>
              
              <a
                href="https://github.com/new?name=ca-bouge-ici"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow"
              >
                <Github className="w-4 h-4" />
                <span className="text-xs">Ouvrir le formulaire pré-rempli (github.com/new)</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
              </a>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  Sur la page GitHub qui s'ouvre :
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                  <li>Le nom <strong>ca-bouge-ici</strong> est déjà écrit automatiquement.</li>
                  <li>Laissez <strong>Public</strong> (recommandé pour avoir la compilation gratuite et illimitée).</li>
                  <li>Ne cochez <strong>pas</strong> « Add a README file ».</li>
                  <li>Descendez tout en bas de la page et cliquez sur le gros bouton vert <strong>« Create repository »</strong>.</li>
                </ul>
              </div>

              <div className="pt-1">
                <a
                  href="/ca-bouge-ici-android-package.zip"
                  download="ca-bouge-ici-android-package.zip"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition-colors border border-slate-300 text-[11px] shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Télécharger l'archive ZIP prête à l'emploi (4.8 Mo)</span>
                </a>
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 pt-2">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Étape 2 : Envoyer le code (2 solutions faciles)</span>
            </h3>

            <div className="pl-7 space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Une fois le dépôt créé sur <code>https://github.com/zwabloua-49/ca-bouge-ici</code>, vous avez deux options simples :
              </p>

              {/* Option A: Web drag-and-drop */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                  <span>Option A (100% dans le navigateur — Sans aucune ligne de commande) :</span>
                </div>
                <p className="text-[11px] text-amber-900">
                  Sur la page GitHub vide de votre dépôt, cliquez sur le lien bleu <strong>« uploading an existing file »</strong>. Décompressez l'archive ZIP téléchargée ci-dessus et glissez tous les dossiers (notamment <code>android</code> et <code>.github</code>) directement dans la page, puis cliquez sur <strong>Commit changes</strong> !
                </p>
              </div>

              {/* Option B: Git commands */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-xs">
                  Option B (Via terminal Git avec votre lien) :
                </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="ex: https://github.com/votre-nom/ca-bouge-ici.git"
                  value={repoUrlInput}
                  onChange={(e) => setRepoUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                />
              </div>

              {/* Terminal command snippet */}
              <div className="relative bg-slate-950 text-emerald-400 p-3.5 rounded-2xl font-mono text-[11px] overflow-x-auto border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <span>Commandes Git à exécuter :</span>
                  </div>
                  <button
                    onClick={() => handleCopy(dynamicGitCommands, 'git-all')}
                    className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCommand === 'git-all' ? 'Copié !' : 'Copier tout'}</span>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">{dynamicGitCommands}</pre>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-950 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Automatisation déclenchée :</strong> Dès que vous faites <code>git push</code>, GitHub Actions lance automatiquement le build de l'APK via le script <code>.github/workflows/build-apk.yml</code>.
                </div>
              </div>
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 pt-2">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Étape 3 : Récupérer et installer votre APK</span>
            </h3>

            <div className="pl-7 space-y-2">
              <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
                <li>
                  Sur votre page GitHub, cliquez sur l'onglet <strong>« Actions »</strong> tout en haut.
                </li>
                <li>
                  Cliquez sur le workflow en cours : <strong>« Build Android APK »</strong> (il prend ~2 à 3 minutes).
                </li>
                <li>
                  Une fois le voyant vert affiché, faites défiler jusqu'à la section <strong>« Artifacts »</strong>.
                </li>
                <li>
                  Cliquez sur <strong>Ca-Bouge-Ici-Debug-APK</strong> pour télécharger l'archive contenant votre fichier <code>app-debug.apk</code>.
                </li>
                <li>
                  Transférez le fichier <code>.apk</code> sur votre téléphone Android (par WhatsApp, Telegram, câble ou Google Drive) et appuyez dessus pour l'installer !
                </li>
              </ol>

              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-[11px]">
                  Votre application Android installée communiquera en direct avec la même base Cloud Firestore sans aucune reconfiguration nécessaire.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Zéro coût · Sans frais d'abonnement Google Play Store pour tester
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleCopy(dynamicGitCommands, 'git-footer')}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors text-xs"
            >
              <Copy className="w-3.5 h-3.5 text-amber-300" />
              <span>{copiedCommand === 'git-footer' ? 'Commandes copiées !' : 'Copier les commandes Git'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
