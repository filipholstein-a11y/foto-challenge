
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Camera, Plus, Moon, Sun, Search, Sparkles, AlertCircle, X, Info, Trophy, ChevronLeft, LayoutDashboard, Shield, LogOut, UserPlus, Settings, Trash2 } from 'lucide-react';
import { Photo, SortOption, Challenge, ChallengePhase, User, UserRole } from './types';
import PhotoCard from './components/PhotoCard';
import Leaderboard from './components/Leaderboard';
import UploadModal from './components/UploadModal';
import CreateChallengeModal from './components/CreateChallengeModal';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import Countdown from './components/Countdown';
import ChallengeCard from './components/ChallengeCard';
import ChallengeDetail from './components/ChallengeDetail';
import { saveChallenges, savePhotos, saveUsers, saveVotes, loadChallenges, loadPhotos, loadUsers, loadVotes } from './services/vercelStorage';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [showQuotaError, setShowQuotaError] = useState(false);
  
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCritique, setSelectedCritique] = useState<Photo | null>(null);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Track votes locally in localStorage + state
  const [votedPhotoIds, setVotedPhotoIds] = useState<string[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(true);

  // Safe storage helper - hybridní přístup (localStorage + cloud v production)
  const safeSave = useCallback(async (key: string, value: any) => {
    try {
      // Lokání cache v localStorage pro development
      localStorage.setItem(key, JSON.stringify(value));
      
      // Synchronizace do Vercel KV v production
      if (import.meta.env.PROD) {
        const saveFn = key === 'photo_contest_photos' 
          ? savePhotos 
          : key === 'photo_contest_challenges' 
          ? saveChallenges 
          : key === 'photo_contest_users' 
          ? saveUsers 
          : saveVotes;
        
        if (saveFn) {
          await saveFn(value);
        }
      }
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.error('LocalStorage quota exceeded!');
        setShowQuotaError(true);
      }
      console.error('Error saving to storage:', e);
    }
  }, []);

  // Persistent storage init - načtení z cloud v production, z localStorage v dev
  useEffect(() => {
    const initStorage = async () => {
      try {
        let savedPhotos, savedChallenges, savedUsers, savedVotes;

        if (import.meta.env.PROD) {
          // Produkce - načtení z Vercel KV
          savedPhotos = (await loadPhotos()) || [];
          savedChallenges = (await loadChallenges()) || [];
          savedUsers = (await loadUsers()) || [];
          savedVotes = (await loadVotes()) || [];
        } else {
          // Development - načtení z localStorage
          savedPhotos = localStorage.getItem('photo_contest_photos');
          savedChallenges = localStorage.getItem('photo_contest_challenges');
          savedUsers = localStorage.getItem('photo_contest_users');
          savedVotes = localStorage.getItem('photo_contest_votes');
        }

        if (import.meta.env.PROD ? savedPhotos?.length : savedPhotos) {
          setPhotos(import.meta.env.PROD ? savedPhotos : JSON.parse(savedPhotos as string));
        }

        if (import.meta.env.PROD ? savedChallenges?.length : savedChallenges) {
          setChallenges(import.meta.env.PROD ? savedChallenges : JSON.parse(savedChallenges as string));
        } else {
          // Mock initial challenge
          const initial: Challenge[] = [{
            id: 'c1',
            title: '1. Zub času',
            description: 'Zachytit pomíjivost věcí, stárnutí materiálů nebo stopy historie v každodenním světě.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1516518151593-90d659e5e780?q=80&w=1200',
            uploadDeadline: Date.now() + 86400000,
            votingDeadline: Date.now() + 172800000,
            creatorId: 'u1',
            maxPhotosPerUser: 6
          }];
          setChallenges(initial);
        }

        if (import.meta.env.PROD ? savedUsers?.length : savedUsers) {
          setUsers(import.meta.env.PROD ? savedUsers : JSON.parse(savedUsers as string));
        } else {
          const initialUsers: User[] = [
            { id: 'u1', username: 'Filip_Admin', role: 'ADMIN', isApproved: true },
            { id: 'u2', username: 'Guest_User', role: 'GUEST', isApproved: true }
          ];
          setUsers(initialUsers);
          setCurrentUser(initialUsers[1]); // Default to guest
        }

        if (import.meta.env.PROD ? savedVotes?.length : savedVotes) {
          setVotedPhotoIds(import.meta.env.PROD ? savedVotes : JSON.parse(savedVotes as string));
        }
      } catch (error) {
        console.error('Error initializing storage:', error);
      } finally {
        setIsLoadingCloud(false);
      }
    };

    initStorage();
  }, []);

  useEffect(() => {
    safeSave('photo_contest_photos', photos);
    safeSave('photo_contest_challenges', challenges);
    safeSave('photo_contest_users', users);
    safeSave('photo_contest_votes', votedPhotoIds);
  }, [photos, challenges, users, votedPhotoIds, safeSave]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Auth Mocks
  const handleLoginAs = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) setCurrentUser(user);
    else {
      const newUser: User = { id: `u_${Date.now()}`, username: `${role}_Mock`, role, isApproved: role !== 'PHOTOGRAPHER' };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
    }
  };

  const handleRegisterPhotographer = () => {
    const name = prompt("Zadejte jméno fotografa:");
    if (!name) return;
    const newUser: User = { id: `u_${Date.now()}`, username: name, role: 'PHOTOGRAPHER', isApproved: false };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    alert("Registrace byla odeslána. Počkejte na schválení adminem.");
  };

  const clearAppData = () => {
    if (confirm("Opravdu chcete vymazat všechna data aplikace? Tím se uvolní místo v prohlížeči.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Logic
  const getPhase = useCallback((c: Challenge): ChallengePhase => {
    if (currentTime < c.uploadDeadline) return 'upload';
    if (currentTime < c.votingDeadline) return 'voting';
    return 'results';
  }, [currentTime]);

  const activeChallenge = useMemo(() => challenges.find(c => c.id === activeChallengeId), [challenges, activeChallengeId]);
  const activePhase = useMemo(() => activeChallenge ? getPhase(activeChallenge) : 'results', [activeChallenge, getPhase]);

  const handleUpload = (data: { title: string, author: string, url: string, aiFeedback?: string }) => {
    try {
      if (!activeChallengeId || !currentUser) return '';
      const photo: Photo = {
        id: `p_${Date.now()}`,
        challengeId: activeChallengeId,
        userId: currentUser.id,
        url: data.url && data.url.trim() ? data.url : '',
        title: data.title,
        author: currentUser.username,
        ratings: [],
        createdAt: Date.now(),
        aiFeedback: data.aiFeedback
      };
      const updatedPhotos = [photo, ...photos];
      setPhotos(updatedPhotos);
      safeSave('photo_contest_photos', updatedPhotos);
      return photo.id;
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Chyba při nahrávání fotografie. Zkus to prosím znovu.');
      return '';
    }
  };

  const handleUpdatePhoto = (photoId: string, updates: Partial<Photo>) => {
    try {
      const updatedPhotos = photos.map(p => p.id === photoId ? { ...p, ...updates } : p);
      setPhotos(updatedPhotos);
      safeSave('photo_contest_photos', updatedPhotos);
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Chyba při aktualizaci fotografie.');
    }
  };

  const handleRate = (photoId: string, value: number) => {
    try {
      if (votedPhotoIds.includes(photoId) || activePhase !== 'voting') return;
      const updatedPhotos = photos.map(p => p.id === photoId ? { ...p, ratings: [...p.ratings, value] } : p);
      setPhotos(updatedPhotos);
      safeSave('photo_contest_photos', updatedPhotos);
      setVotedPhotoIds([...votedPhotoIds, photoId]);
    } catch (error) {
      console.error('Error rating photo:', error);
      alert('Chyba při hlasování. Zkus to prosím znovu.');
    }
  };

  const handleCreateChallenge = (data: { title: string, description: string, thumbnailUrl: string, uploadDays: number, votingDays: number, maxPhotosPerUser: number }) => {
    try {
      const newChallenge: Challenge = {
        id: `c_${Date.now()}`,
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl && data.thumbnailUrl.trim() ? data.thumbnailUrl : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
        uploadDeadline: Date.now() + (data.uploadDays * 86400000),
        votingDeadline: Date.now() + ((data.uploadDays + data.votingDays) * 86400000),
        creatorId: currentUser?.id || 'admin',
        maxPhotosPerUser: data.maxPhotosPerUser
      };
      setChallenges([newChallenge, ...challenges]);
      safeSave('photo_contest_challenges', [newChallenge, ...challenges]);
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Chyba při vytváření výzvy. Zkus to prosím znovu.');
    }
  };

  const filteredPhotos = useMemo(() => {
    let res = photos.filter(p => p.challengeId === activeChallengeId);
    if (searchQuery) res = res.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.author.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return res.sort((a, b) => {
      const getAvg = (p: Photo) => p.ratings.length ? p.ratings.reduce((x,y)=>x+y,0)/p.ratings.length : 0;
      if (sortBy === 'rating') return getAvg(b) - getAvg(a);
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      return b.createdAt - a.createdAt;
    });
  }, [photos, activeChallengeId, searchQuery, sortBy]);

  const userPhotoCount = photos.filter(p => p.challengeId === activeChallengeId && p.userId === currentUser?.id).length;
  const currentMaxPhotos = activeChallenge?.maxPhotosPerUser || 6;
  const canUpload = (currentUser?.role === 'PHOTOGRAPHER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR') && 
                    currentUser?.isApproved && 
                    activePhase === 'upload' && 
                    userPhotoCount < currentMaxPhotos;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-inter transition-colors duration-500">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveChallengeId(null)}>
            <div className="bg-primary-600 p-2.5 rounded-2xl shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-all">
              <Camera className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight hidden sm:block">
              Foto<span className="text-primary-500">challenge</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Mock Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 gap-1 border border-slate-200 dark:border-slate-800">
              <button onClick={() => handleLoginAs('ADMIN')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${currentUser?.role === 'ADMIN' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-500' : 'text-slate-500'}`}>ADMIN</button>
              <button onClick={() => handleLoginAs('EDITOR')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${currentUser?.role === 'EDITOR' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-500' : 'text-slate-500'}`}>EDITOR</button>
              <button onClick={() => handleLoginAs('PHOTOGRAPHER')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${currentUser?.role === 'PHOTOGRAPHER' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-500' : 'text-slate-500'}`}>PHOTOGRAPHER</button>
              <button onClick={() => handleLoginAs('GUEST')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${currentUser?.role === 'GUEST' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-500' : 'text-slate-500'}`}>GUEST</button>
            </div>

            {currentUser?.role === 'ADMIN' && (
              <button onClick={() => setIsAdminPanelOpen(true)} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl hover:bg-primary-500/10 hover:text-primary-500 transition-all border border-slate-200 dark:border-slate-800">
                <Shield size={20} />
              </button>
            )}

            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR') && !activeChallengeId && (
              <button onClick={() => setIsCreateModalOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white font-black px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-600/20">
                <Plus size={20} /> <span className="hidden sm:inline">Nová výzva</span>
              </button>
            )}

            {!currentUser?.isApproved && currentUser?.role === 'PHOTOGRAPHER' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-xl border border-amber-500/20">
                <AlertCircle size={14} /> ČEKÁ NA SCHVÁLENÍ
              </div>
            )}

            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {showQuotaError && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between text-red-500">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">Úložiště prohlížeče je plné! Fotografie s velkým rozlišením zabírají mnoho místa.</p>
            </div>
            <button 
              onClick={clearAppData}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600 transition-all"
            >
              <Trash2 size={14} /> VYMAZAT DATA
            </button>
          </div>
        </div>
      )}

      {!activeChallengeId ? (
        /* DASHBOARD */
        <main className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-5xl lg:text-7xl font-black tracking-tight mb-6">Objevuj své <span className="text-primary-600">vizuální limity.</span></h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">Pravidelné tématické výzvy pro nadšence i profesionály. Nahrávej, hlasuj a uč se s AI kritikou.</p>
            </div>
            {currentUser?.role === 'GUEST' && (
              <button onClick={handleRegisterPhotographer} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-3xl font-black flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm">
                <UserPlus className="text-primary-500" /> Stát se fotografem
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map(c => (
              <ChallengeCard 
                key={c.id} 
                challenge={c} 
                phase={getPhase(c)} 
                photoCount={photos.filter(p => p.challengeId === c.id).length}
                onClick={() => setActiveChallengeId(c.id)}
                isPhotographer={currentUser?.role === 'PHOTOGRAPHER' && currentUser?.isApproved}
              />
            ))}
          </div>
        </main>
      ) : (
        /* CHALLENGE DETAIL PAGE */
        <ChallengeDetail
          challenge={activeChallenge!}
          phase={activePhase}
          currentTime={currentTime}
          photos={photos}
          maxPhotosPerUser={activeChallenge?.maxPhotosPerUser || 6}
          currentUserId={currentUser?.id || ''}
          isPhotographer={currentUser?.role === 'PHOTOGRAPHER' && currentUser?.isApproved}
          onBack={() => setActiveChallengeId(null)}
          onUpload={() => setIsUploadModalOpen(true)}
          onRatePhoto={handleRate}
          votedPhotoIds={votedPhotoIds}
        />
      )}

      <Footer />

      {/* Modals */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleUpload} 
        onUpdatePhoto={handleUpdatePhoto}
        canUpload={canUpload}
        maxPhotos={currentMaxPhotos}
      />
      
      {isCreateModalOpen && (
        <CreateChallengeModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreate={handleCreateChallenge} 
        />
      )}

      {isAdminPanelOpen && (
        <AdminPanel 
          users={users}
          onApprove={(uid) => setUsers(users.map(u => u.id === uid ? { ...u, isApproved: true } : u))}
          onChangeRole={(uid, r) => setUsers(users.map(u => u.id === uid ? { ...u, role: r } : u))}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}

      {/* AI Critique Modal */}
      {selectedCritique && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
             <div className="relative aspect-video">
                <img src={selectedCritique.url} alt={selectedCritique.title} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedCritique(null)}
                  className="absolute top-4 right-4 p-2.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-md border border-white/20"
                >
                  <X size={20} />
                </button>
             </div>
             <div className="p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/40 rounded-2xl text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">AI Kritika Gemini</h3>
                    <p className="text-sm text-slate-500 font-medium">Analýza kompozice a světla</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic text-xl">
                    "{selectedCritique.aiFeedback || "Analýza není dostupná."}"
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCritique(null)}
                  className="mt-8 w-full bg-primary-600 text-white hover:bg-primary-700 py-5 rounded-2xl font-black transition-all shadow-xl shadow-primary-600/20 border border-primary-500"
                >
                  Zpět do galerie
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
