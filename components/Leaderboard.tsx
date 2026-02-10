
import React from 'react';
import { Trophy, Medal, Crown, Star } from 'lucide-react';
import { Photo } from '../types';

interface LeaderboardProps {
  photos: Photo[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ photos }) => {
  const getAverage = (p: Photo) => p.ratings.length > 0 
    ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length 
    : 0;

  const sortedPhotos = [...photos]
    .sort((a, b) => getAverage(b) - getAverage(a) || b.ratings.length - a.ratings.length)
    .slice(0, 5);

  if (photos.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 h-fit sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-amber-500" />
        <h2 className="text-xl font-bold">Žebříček</h2>
      </div>

      <div className="space-y-4">
        {sortedPhotos.map((photo, index) => (
          <div key={photo.id} className="flex items-center gap-4 group cursor-pointer">
            <div className="relative flex-shrink-0">
              <img 
                src={photo.url} 
                alt={photo.title} 
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-primary-500 transition-all"
              />
              <div className="absolute -top-2 -left-2 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-[10px] font-bold">
                {index === 0 ? <Crown size={12} className="text-amber-500" /> : index + 1}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-primary-500 transition-colors">{photo.title}</p>
              <p className="text-xs text-slate-500 truncate">od {photo.author}</p>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-amber-500">
                <span className="text-sm font-black">{getAverage(photo).toFixed(1)}</span>
                <Star size={10} className="fill-current" />
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{photo.ratings.length} hlasů</span>
            </div>
          </div>
        ))}

        {sortedPhotos.length === 0 && (
          <p className="text-sm text-slate-500 italic text-center py-4">Zatím žádné hlasy</p>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Aktuální vítěz</p>
        {sortedPhotos[0] && (
           <div className="mt-4 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/50">
             <div className="flex items-center justify-center mb-2">
                <Medal className="text-primary-500" />
             </div>
             <p className="text-sm font-medium text-primary-900 dark:text-primary-100">"{sortedPhotos[0].title}"</p>
             <p className="text-xs text-primary-600/80 dark:text-primary-400/80 mt-1">S průměrem {getAverage(sortedPhotos[0]).toFixed(1)} hvězd!</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
