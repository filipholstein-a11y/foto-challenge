import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Loader2 } from 'lucide-react';
import { Challenge, ChallengePhase, Photo } from '../types';
import Countdown from './Countdown';
import StarRating from './StarRating';

interface ChallengeDetailProps {
  challenge: Challenge;
  phase: ChallengePhase;
  currentTime: number;
  photos: Photo[];
  maxPhotosPerUser: number;
  currentUserId: string;
  isPhotographer: boolean;
  onBack: () => void;
  onUpload: () => void;
  onRatePhoto: (photoId: string, rating: number) => void;
  votedPhotoIds: string[];
}

const ChallengeDetail: React.FC<ChallengeDetailProps> = ({
  challenge,
  phase,
  currentTime,
  photos,
  maxPhotosPerUser,
  currentUserId,
  isPhotographer,
  onBack,
  onUpload,
  onRatePhoto,
  votedPhotoIds,
}) => {
  const isUploadPhase = phase === 'upload';
  const isVotingPhase = phase === 'voting';

  // Filtruj fotky pro tuto soutěž
  const challengePhotos = useMemo(
    () => photos.filter(p => p.challengeId === challenge.id),
    [photos, challenge.id]
  );

  // Počet fotek, které tento uživatel nahrál
  const userPhotoCount = useMemo(
    () => challengePhotos.filter(p => p.userId === currentUserId).length,
    [challengePhotos, currentUserId]
  );

  // Celkový počet slotů (fotografie na uživatele jako ukazatel počtu účastníků)
  // Celkový počet fotografií dělený max fotek na fotografa = počet fotografů
  const estimatedPhotographers = Math.max(2, Math.ceil(challengePhotos.length / maxPhotosPerUser));
  const totalSlots = estimatedPhotographers * maxPhotosPerUser;

  // Vytvoř grid s fotkami a prázdnými sloty
  const gridItems = useMemo(() => {
    const items: Array<{ type: 'photo' | 'empty'; photo?: Photo; index: number }> = [];

    // Přidej existující fotky
    for (let i = 0; i < challengePhotos.length; i++) {
      const photo = challengePhotos[i];
      items.push({ type: 'photo', photo, index: i });
    }

    // Přidej prázdné sloty
    for (let i = challengePhotos.length; i < totalSlots; i++) {
      items.push({ type: 'empty', index: i });
    }

    return items;
  }, [challengePhotos, totalSlots]);

  const canUpload = isPhotographer && isUploadPhase && userPhotoCount < maxPhotosPerUser;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black flex-1 ml-4">{challenge.title}</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Popis a info */}
        <div className="mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-black mb-4">Zadání</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
              {challenge.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Max. fotek na fotografa</p>
                <p className="text-3xl font-black text-primary-600">{maxPhotosPerUser}</p>
              </div>

              {isUploadPhase && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Zbývá na nahrání</p>
                  <Countdown deadline={challenge.uploadDeadline} label="" />
                </div>
              )}

              {isVotingPhase && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                  <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">Zbývá na hlasování</p>
                  <Countdown deadline={challenge.votingDeadline} label="" />
                </div>
              )}

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Celkem fotek</p>
                <p className="text-3xl font-black text-slate-700 dark:text-slate-200">{challengePhotos.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fotka a ratings */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">Příspěvky fotografů</h2>
            {canUpload && (
              <button
                onClick={onUpload}
                className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg"
              >
                <Plus size={20} /> Nahrát fotografii
              </button>
            )}
          </div>

          {/* Grid fotografií - 3-4 sloupce, menší dlaždice */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {gridItems.map((item) => {
              if (item.type === 'photo' && item.photo) {
                // Existující fotka
                const isOwnPhoto = item.photo.userId === currentUserId;
                const isBlurred = isUploadPhase && !isOwnPhoto;
                const hasVoted = votedPhotoIds.includes(item.photo.id);

                return (
                  <div
                    key={item.photo.id}
                    className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Obrázek */}
                    <div className={`relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 ${isBlurred ? 'blur-lg' : ''}`}>
                      <img
                        src={item.photo.url}
                        alt={item.photo.title}
                        className="w-full h-full object-cover"
                      />
                      {isUploadPhase && !isOwnPhoto && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold bg-black/60 px-2 py-0.5 rounded-full">
                            Nahrána
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <h3 className="font-black text-xs mb-0.5 truncate">{item.photo.title}</h3>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 mb-2 truncate">
                        {item.photo.author}
                      </p>

                      {/* Upload phase - jen info bez hodnocení */}
                      {isUploadPhase && (
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                          <p className="text-[9px] text-slate-400">
                            Hlasů: {item.photo.ratings.length}
                          </p>
                        </div>
                      )}

                      {/* Rating v voting fázi */}
                      {isVotingPhase && !isOwnPhoto && (
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hlasovat</p>
                          <StarRating
                            rating={hasVoted ? 0 : 0}
                            onRate={(value) => {
                              if (!hasVoted) {
                                onRatePhoto(item.photo!.id, value);
                              }
                            }}
                            average={item.photo.ratings.length > 0 ? item.photo.ratings.reduce((a, b) => a + b, 0) / item.photo.ratings.length : 0}
                            count={item.photo.ratings.length}
                            disabled={hasVoted}
                            size={12}
                          />
                          {hasVoted && (
                            <p className="text-[8px] text-primary-600 font-bold mt-1">Hlasováno ✓</p>
                          )}
                        </div>
                      )}
                      {isVotingPhase && isOwnPhoto && (
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tvoje foto:</p>
                          <StarRating
                            average={item.photo.ratings.length > 0 ? item.photo.ratings.reduce((a, b) => a + b, 0) / item.photo.ratings.length : 0}
                            onRate={() => {}}
                            count={item.photo.ratings.length}
                            disabled={true}
                            size={12}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              } else {
                // Prázdný slot s ikonou +
                return (
                  <div
                    key={`slot-${item.index}`}
                    className="bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 aspect-square flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                    onClick={() => {
                      if (canUpload) onUpload();
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Plus
                        size={20}
                        className="text-slate-400 group-hover:text-primary-500 transition-colors"
                      />
                      {canUpload && (
                        <span className="text-[9px] font-bold text-slate-500 group-hover:text-primary-500 text-center px-1">
                          Nahrát
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {!isPhotographer && isUploadPhase && (
            <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Aby jsi mohl nahrát fotografie, musíš být propojen jako fotograf.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChallengeDetail;
