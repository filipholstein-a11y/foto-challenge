
import React, { useState } from 'react';
import { X, Calendar, PlusCircle, Layers, Upload, Loader2, AlertCircle } from 'lucide-react';
import { uploadImageToBlob } from '../services/vercelStorage';

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
  const [thumbnailData, setThumbnailData] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(DEFAULT_THUMBNAIL);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setThumbnailData(dataUrl);
          setPreviewUrl(dataUrl);
          setError(null);
        };
        reader.onerror = () => {
          setError('Chyba při čtení souboru obrázku');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Error handling thumbnail:', err);
      setError('Chyba při zpracování obrázku');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);
      setError(null);
      
      let finalThumbnailUrl = DEFAULT_THUMBNAIL;

      // Pokud byl nahrán vlastní obrázek, ulož ho do Blob
      if (thumbnailData) {
        const fileName = `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
        const uploadedUrl = await uploadImageToBlob(thumbnailData, fileName);
        
        if (!uploadedUrl) {
          setError('Nepodařilo se nahrát obrázek do cloudu');
          setIsUploading(false);
          return;
        }
        
        finalThumbnailUrl = uploadedUrl;
      }

      onCreate({ 
        title, 
        description, 
        thumbnailUrl: finalThumbnailUrl, 
        uploadDays, 
        votingDays, 
        maxPhotosPerUser 
      });
      
      onClose();
    } catch (err) {
      console.error('Error creating challenge:', err);
      setError('Chyba při vytváření výzvy');
    } finally {
      setIsUploading(false);
    }
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Náhled obrázku */}
          <div className="relative group">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Obrázek výzvy</label>
            <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 mb-2 relative cursor-pointer hover:border-primary-500 transition-colors">
              <img src={previewUrl} alt="Náhled" className="w-full h-full object-cover" />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleThumbnailChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity flex-col gap-2">
                <Upload size={24} className="text-white" />
                <span className="text-white text-xs font-bold uppercase tracking-widest">Klikni pro nahrání</span>
              </div>
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

          <button 
            type="submit" 
            disabled={isUploading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Nahrávám...
              </>
            ) : (
              <>
                <PlusCircle size={20} /> Vytvořit výzvu
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChallengeModal;
