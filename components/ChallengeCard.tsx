
import React, { useState } from 'react';
import { Calendar, Users, ArrowRight, Timer, Lock, Star } from 'lucide-react';
import { Challenge, ChallengePhase } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  phase: ChallengePhase;
  photoCount: number;
  onClick: () => void;
  latestPhotos?: string[];
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000";

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, phase, photoCount, onClick }) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(`photo-${index}`));
  };

  const getThumbnailUrl = () => {
    return challenge.thumbnailUrl && challenge.thumbnailUrl.trim() ? challenge.thumbnailUrl : FALLBACK_IMAGE;
  };
  const getStatusConfig = () => {
    switch (phase) {
      case 'upload':
        return { label: 'Probíhá nahrávání', color: 'bg-amber-500', icon: <Timer size={14} /> };
      case 'voting':
        return { label: 'Hlasování otevřeno', color: 'bg-green-500', icon: <Star size={14} /> };
      case 'results':
        return { label: 'Ukončeno', color: 'bg-slate-500', icon: <Lock size={14} /> };
      default:
        return { label: 'Již brzy', color: 'bg-primary-500', icon: <Calendar size={14} /> };
    }
  };

  const status = getStatusConfig();

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200 dark:border-slate-800 flex flex-col h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {latestPhotos && latestPhotos.length > 0 ? (
          <div className="w-full h-full grid grid-cols-3 gap-0">
            {latestPhotos.slice(0,3).map((u, i) => {
              const hasError = imageErrors.has(`photo-${i}`);
              const src = hasError ? FALLBACK_IMAGE : u;
              return (
                <img 
                  key={i} 
                  src={src} 
                  alt={`${challenge.title}-${i}`}
                  onError={() => handleImageError(i)}
                  className={`w-full h-full object-cover ${i===0? 'col-span-2 row-span-2': ''}`} 
                />
              );
            })}
          </div>
        ) : (
          <img 
            src={getThumbnailUrl()} 
            alt={challenge.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg ${status.color}`}>
            {status.icon}
            {status.label}
          </div>
        </div>

        <div className="absolute bottom-4 left-6 right-6">
          <h3 className="text-white text-2xl font-black leading-tight group-hover:text-primary-400 transition-colors">
            {challenge.title}
          </h3>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6">
          {challenge.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Příspěvků</span>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">{photoCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Konec</span>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                {new Date(challenge.votingDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all">
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
