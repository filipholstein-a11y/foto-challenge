
import React, { useState } from 'react';
import { User, Clock, Sparkles, MessageCircle, Lock, CheckCircle } from 'lucide-react';
import { Photo, ChallengePhase } from '../types';
import StarRating from './StarRating';

interface PhotoCardProps {
  photo: Photo;
  phase: ChallengePhase;
  hasVoted: boolean;
  onRate: (id: string, value: number) => void;
  onShowCritique: (photo: Photo) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, phase, hasVoted, onRate, onShowCritique }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isBlurred = phase === 'upload';
  
  const averageRating = photo.ratings.length > 0 
    ? photo.ratings.reduce((a, b) => a + b, 0) / photo.ratings.length 
    : 0;

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'před chvílí';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `před ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `před ${hours} h`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200 dark:border-slate-800 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/5] overflow-hidden relative bg-slate-200 dark:bg-slate-800">
        <img 
          src={photo.url} 
          alt={photo.title}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            isBlurred ? 'blur-[64px] grayscale opacity-40 scale-150' : 'group-hover:scale-110'
          }`}
        />
        
        {isBlurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <div className="bg-white/10 backdrop-blur-3xl p-6 rounded-full mb-3 border border-white/20">
              <Lock size={40} className="text-white" />
            </div>
            <p className="text-white font-black text-xl drop-shadow-xl">Odevzdáno</p>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2 px-4">Odhalení proběhne po ukončení nahrávání</p>
          </div>
        )}

        {!isBlurred && (
          <>
            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute bottom-0 left-0 right-0 p-6 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-4 opacity-0'}`}>
              <h3 className="text-white font-black text-xl mb-1 truncate">{photo.title}</h3>
              <div className="flex items-center text-white/60 text-xs gap-2 font-medium">
                <User size={12} />
                <span>{photo.author}</span>
              </div>
            </div>
            {photo.aiFeedback && (
              <button 
                onClick={(e) => { e.stopPropagation(); onShowCritique(photo); }}
                className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20 hover:bg-primary-600/40 transition-colors"
                title="AI Analýza"
              >
                <Sparkles size={18} />
              </button>
            )}
          </>
        )}
      </div>

      <div className="p-5 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            <Clock size={12} />
            <span>{timeAgo(photo.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
             {hasVoted && (
               <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-tighter">
                  <CheckCircle size={10} />
                  <span>Hlasováno</span>
               </div>
             )}
          </div>
        </div>
        
        <StarRating 
          average={averageRating}
          count={photo.ratings.length}
          onRate={(v) => onRate(photo.id, v)}
          disabled={phase !== 'voting' || hasVoted}
        />
      </div>
    </div>
  );
};

export default PhotoCard;
