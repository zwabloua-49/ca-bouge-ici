import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeFeed } from './components/HomeFeed';
import { InteractiveMap } from './components/InteractiveMap';
import { BusinessDirectory } from './components/BusinessDirectory';
import { UserProfile } from './components/UserProfile';
import { ReportModal } from './components/ReportModal';
import { LocationModal } from './components/LocationModal';
import { AddBusinessModal } from './components/AddBusinessModal';
import { AbuseModal } from './components/AbuseModal';
import { FirestoreDiagnosticModal } from './components/FirestoreDiagnosticModal';
import { AndroidBuildModal } from './components/AndroidBuildModal';
import { StorageService } from './services/storageService';
import {
  auth,
  loginWithGoogle,
  subscribeToAuthChanges,
  testFirestoreConnection,
} from './services/firebase';
import { FirestoreSyncService } from './services/firestoreSync';
import {
  AbuseReason,
  AppTab,
  AppUser,
  Business,
  BusinessCategory,
  Coordinates,
  Report,
  ReportCategory,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('accueil');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [reports, setReports] = useState<Report[]>(() => StorageService.getReports());
  const [businesses, setBusinesses] = useState<Business[]>(() => StorageService.getBusinesses());
  const [currentLocation, setCurrentLocation] = useState(() => StorageService.getActiveLocation());
  const [lowDataMode, setLowDataMode] = useState(() => StorageService.getLowDataMode());

  // Firestore sync & loading state
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [abuseReportTarget, setAbuseReportTarget] = useState<Report | null>(null);

  // 1. One-off fetch helper using getDocs
  const refreshReportsFromFirestore = async (showLoading = false) => {
    if (showLoading) setIsSyncing(true);
    try {
      const pubs = await FirestoreSyncService.getPublications();
      setReports(pubs);
      StorageService.saveReports(pubs);
      setReportsError(null);
    } catch (err) {
      console.error('Erreur getPublications Firestore:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setReportsError(`Erreur Firestore : ${msg}`);
    } finally {
      setIsLoadingReports(false);
      setIsSyncing(false);
    }
  };

  // 2. Listen to Firebase Authentication
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribeAuth = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      if (user?.uid) {
        FirestoreSyncService.seedInitialData(user.uid, user.displayName || 'Résident');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 3. Dual Fetch & Realtime Sync with Cloud Firestore
  useEffect(() => {
    // Immediate one-off load via getDocs
    refreshReportsFromFirestore(false);

    // Continuous Realtime listener via onSnapshot
    const unsubReports = FirestoreSyncService.subscribeToReports(
      (firestoreReports) => {
        setIsLoadingReports(false);
        setReportsError(null);
        setReports(firestoreReports);
        StorageService.saveReports(firestoreReports);
      },
      (err) => {
        console.warn('Firestore onSnapshot error:', err);
        setReportsError(err.message || 'Erreur de synchronisation temps réel');
        setIsLoadingReports(false);
      }
    );

    // Subscribe to live businesses in Firestore
    const unsubBusinesses = FirestoreSyncService.subscribeToBusinesses((firestoreBiz) => {
      if (firestoreBiz && firestoreBiz.length > 0) {
        setBusinesses(firestoreBiz);
        StorageService.saveBusinesses(firestoreBiz);
      }
    });

    return () => {
      if (unsubReports) unsubReports();
      if (unsubBusinesses) unsubBusinesses();
    };
  }, []);

  // Sync active location
  const handleSelectLocation = (loc: { city: string; commune: string; quartier: string }) => {
    setCurrentLocation(loc);
    StorageService.setActiveLocation(loc);
  };

  // Low Data Mode
  const handleToggleLowDataMode = () => {
    const next = !lowDataMode;
    setLowDataMode(next);
    StorageService.setLowDataMode(next);
  };

  // Voting with Firestore and local fallback
  const handleVote = async (id: string, type: 'confirm' | 'contest') => {
    const targetReport = reports.find((r) => r.id === id);
    if (!targetReport) return;

    if (currentUser?.uid) {
      try {
        await FirestoreSyncService.voteReport(id, targetReport, currentUser.uid, type);
        refreshReportsFromFirestore(false);
        return;
      } catch (err) {
        console.warn('Firestore vote fallback to local:', err);
      }
    }

    // Local fallback for guest users
    const res = StorageService.voteReport(id, type);
    setReports(res.reports);
  };

  // Submitting new publication to Cloud Firestore collection "publications"
  const handleSubmitReport = async (data: {
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
  }) => {
    if (!currentUser?.uid) {
      throw new Error(
        "Connexion requise : Veuillez vous connecter avec votre compte pour publier dans votre quartier et enregistrer sur Cloud Firestore."
      );
    }

    const authorId = currentUser.uid;
    const authorName = currentUser.displayName || data.authorName;

    // Direct write to Cloud Firestore collection "publications"
    const newPubId = await FirestoreSyncService.addPublication(
      {
        ...data,
        authorName,
      },
      authorId
    );

    // Optimistic addition so user sees their new publication immediately
    const optimisticReport: Report = {
      id: newPubId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      status: 'non_verifie',
      city: data.city || 'Abidjan',
      commune: data.commune || 'Port-Bouët (Zone pilote)',
      quartier: data.quartier || 'Gonzagueville (Terre Rouge)',
      landmark: data.landmark?.trim() || 'Gonzagueville',
      createdAt: data.createdAt || new Date().toISOString(),
      confirmationsCount: 1,
      contestationsCount: 0,
      confirmedBy: [authorId],
      contestedBy: [],
      userVote: 'confirm',
      isDemo: false,
      authorId,
      authorName,
      coordinates: data.coordinates,
      abuseReportsCount: 0,
      imageUrl: data.imageUrl,
    };

    setReports((prev) => [optimisticReport, ...prev.filter((r) => r.id !== newPubId)]);

    // Trigger fast server sync
    refreshReportsFromFirestore(false);

    setActiveTab('accueil');
  };

  // Deleting report
  const handleDeleteReport = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce signalement ?')) {
      // Optimistic delete
      setReports((prev) => prev.filter((r) => r.id !== id));
      StorageService.deleteReport(id);

      try {
        await FirestoreSyncService.deleteReport(id);
      } catch (err) {
        console.warn('Fallback to local delete:', err);
      }
    }
  };

  // Submitting new business
  const handleSubmitBusiness = async (data: {
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
  }) => {
    const authorId = currentUser?.uid || `anon-${Date.now()}`;
    try {
      if (currentUser?.uid) {
        await FirestoreSyncService.addBusiness(data, authorId);
      } else {
        StorageService.addBusiness(data);
        setBusinesses(StorageService.getBusinesses());
      }
    } catch (err) {
      console.warn('Fallback local business:', err);
      StorageService.addBusiness(data);
      setBusinesses(StorageService.getBusinesses());
    }
    setActiveTab('commerces');
  };

  // Submitting abuse
  const handleSubmitAbuse = async (
    reportId: string,
    reportTitle: string,
    reason: AbuseReason,
    comment: string
  ) => {
    const authorId = currentUser?.uid || `anon-${Date.now()}`;
    try {
      if (currentUser?.uid) {
        await FirestoreSyncService.reportAbuse(reportId, reportTitle, reason, comment, authorId);
      }
    } catch (err) {
      console.warn('Fallback local abuse:', err);
    }
    StorageService.reportAbuse(reportId, reportTitle, reason, comment);
    setReports(StorageService.getReports());
  };

  // Reset to demo
  const handleResetData = () => {
    const res = StorageService.resetAllToDemo();
    setReports(res.reports);
    setBusinesses(res.businesses);
  };

  const handleTabChange = (tab: AppTab) => {
    if (tab === 'signaler') {
      setIsReportModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const pendingAbusesCount = StorageService.getAbuseReports().filter(
    (a) => a.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-amber-300 selection:text-emerald-950">
      {/* Top Bar Contract (Wordmark, Location, Utilities, Google Auth) */}
      <Navbar
        currentLocation={currentLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        lowDataMode={lowDataMode}
        onToggleLowDataMode={handleToggleLowDataMode}
        onOpenAdmin={() => setActiveTab('profil')}
        currentUser={currentUser}
        onLogin={loginWithGoogle}
        onOpenProfile={() => setActiveTab('profil')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 pb-24">
        {activeTab === 'accueil' && (
          <HomeFeed
            reports={reports}
            onVote={handleVote}
            onOpenAbuseModal={(rep) => setAbuseReportTarget(rep)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenMap={() => setActiveTab('carte')}
            onDeleteReport={handleDeleteReport}
            activeCommune={currentLocation.commune}
            activeQuartier={currentLocation.quartier}
            lowDataMode={lowDataMode}
            currentUser={currentUser}
            onOpenDiagnostic={() => setIsDiagnosticModalOpen(true)}
            onOpenAndroidBuild={() => setIsAndroidModalOpen(true)}
            isLoadingReports={isLoadingReports}
            reportsError={reportsError}
            isSyncing={isSyncing}
            onRefreshReports={() => refreshReportsFromFirestore(true)}
          />
        )}

        {activeTab === 'carte' && (
          <InteractiveMap
            reports={reports}
            businesses={businesses}
            onVote={handleVote}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            activeQuartier={currentLocation.quartier}
          />
        )}

        {activeTab === 'commerces' && (
          <BusinessDirectory
            businesses={businesses}
            onOpenAddModal={() => setIsAddBusinessModalOpen(true)}
            activeCommune={currentLocation.commune}
            activeQuartier={currentLocation.quartier}
            lowDataMode={lowDataMode}
          />
        )}

        {activeTab === 'profil' && (
          <UserProfile
            currentLocation={currentLocation}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            lowDataMode={lowDataMode}
            onToggleLowDataMode={handleToggleLowDataMode}
            reports={reports}
            onUpdateReports={(newReports) => setReports(newReports)}
            onResetData={handleResetData}
            currentUser={currentUser}
            onOpenDiagnostic={() => setIsDiagnosticModalOpen(true)}
            onOpenAndroidBuild={() => setIsAndroidModalOpen(true)}
          />
        )}
      </main>

      {/* Fixed Bottom Tab Bar (Accueil, Carte, Signaler, Commerces, Profil) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        pendingAbuseCount={pendingAbusesCount}
      />

      {/* Modals & Drawers */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleSubmitReport}
        defaultLocation={currentLocation}
        currentUser={currentUser}
        onLogin={loginWithGoogle}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
      />

      <AddBusinessModal
        isOpen={isAddBusinessModalOpen}
        onClose={() => setIsAddBusinessModalOpen(false)}
        onSubmitBusiness={handleSubmitBusiness}
        defaultLocation={currentLocation}
      />

      <AbuseModal
        report={abuseReportTarget}
        isOpen={!!abuseReportTarget}
        onClose={() => setAbuseReportTarget(null)}
        onSubmitAbuse={handleSubmitAbuse}
      />

      <FirestoreDiagnosticModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => refreshReportsFromFirestore(true)}
      />

      <AndroidBuildModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
}
