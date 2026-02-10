
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  onRate: (value: number) => void;
  average: number;
  count: number;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ onRate, average, count, disabled }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => !disabled && onRate(star)}
            className={`transition-all duration-200 ${disabled ? 'cursor-default' : 'hover:scale-125'}`}
          >
            <Star
              size={18}
              className={`${
                (hover || average) >= star
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
        {average.toFixed(1)} / {count} hlasů
      </div>
    </div>
  );
};

export default StarRating;
