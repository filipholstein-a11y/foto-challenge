
import React, { useState } from 'react';
import { X, Calendar, PlusCircle, Layers } from 'lucide-react';

interface CreateChallengeModalProps {
  onClose: () => void;
  onCreate: (data: { title: string, description: string, thumbnailUrl: string, uploadDays: number, votingDays: number, maxPhotosPerUser: number }) => void;
}

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000";

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadDays, setUploadDays] = useState(2);
  const [votingDays, setVotingDays] = useState(3);
  const [maxPhotosPerUser, setMaxPhotosPerUser] = useState(6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ 
      title, 
      description, 
      thumbnailUrl: DEFAULT_THUMBNAIL, 
      uploadDays, 
      votingDays, 
      maxPhotosPerUser 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-black">Nová výzva</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-2 relative group">
            <img src={DEFAULT_THUMBNAIL} alt="Výchozí náhled" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold uppercase tracking-widest">Výchozí náhled nastaven</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Název výzvy</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Např. Architektura města"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Zadání (popis)</label>
            <textarea 
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Dny na nahrávání</label>
              <input 
                type="number" 
                min={1} 
                value={uploadDays}
                onChange={(e) => setUploadDays(parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Dny na hlasování</label>
              <input 
                type="number" 
                min={1} 
                value={votingDays}
                onChange={(e) => setVotingDays(parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Layers size={14} /> Max. počet fotografií na účastníka
            </label>
            <input 
              required
              type="number" 
              min={1}
              max={20}
              value={maxPhotosPerUser}
              onChange={(e) => setMaxPhotosPerUser(parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2">
            <PlusCircle size={20} /> Vytvořit výzvu
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChallengeModal;
