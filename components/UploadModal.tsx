
import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Loader2, Info } from 'lucide-react';
import { getPhotoCritique } from '../services/geminiService';
import { put } from '@vercel/blob';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onUpload should return the created photo id so we can update it later
  onUpload: (data: { title: string, author: string, url: string, aiFeedback?: string }) => string;
  // allow updating an existing photo (used to save AI feedback after upload)
  onUpdatePhoto: (photoId: string, updates: { aiFeedback?: string }) => void;
  canUpload: boolean;
  maxPhotos: number;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, onUpdatePhoto, canUpload, maxPhotos }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [withAI, setWithAI] = useState(true);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setFilePreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpload || !file || !title || !author) return;

    // 1) Upload to Vercel Blob
    let uploadedUrl = '';
    try {
      const pathname = `uploads/${Date.now()}-${file.name}`;
      const blob = await put(pathname, file, { access: 'public', addRandomSuffix: true });
      uploadedUrl = blob.downloadUrl || (blob as any).url || '';
    } catch (err) {
      console.error('Upload to Vercel Blob failed', err);
      alert('Nepodařilo se nahrát fotografii.');
      return;
    }

    // 2) Persist the photo (URL only) and get the created photo id
    const createdId = onUpload({ title, author, url: uploadedUrl });

    // 3) Call AI critique using the URL and then update the saved photo with returned feedback
    if (withAI && createdId) {
      setIsAnalyzing(true);
      const aiFeedback = await getPhotoCritique(uploadedUrl, title);
      setIsAnalyzing(false);
      try {
        onUpdatePhoto(createdId, { aiFeedback });
      } catch (e) {
        console.error('Failed to update photo with AI feedback', e);
      }
    }
    onClose();
    setTitle('');
    setAuthor('');
    setFile(null);
    setFilePreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold">Nahrát fotografii</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {!canUpload ? (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-full">
               <Info size={48} />
            </div>
            <h3 className="text-xl font-bold">Limit naplněn</h3>
            <p className="text-slate-500">Do každé výzvy můžeš nahrát maximálně {maxPhotos} fotografií. Tento limit jsi již pro aktuální výzvu vyčerpal.</p>
            <button onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 py-3 rounded-2xl font-bold mt-4 border border-slate-200 dark:border-slate-700">Rozumím</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Název fotky</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Např. Západ slunce v horách"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Autor</label>
                <input 
                  required
                  type="text" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Vaše jméno"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  required={!file}
                />
                {filePreview ? (
                  <div className="relative w-full">
                    <img src={filePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl shadow-md" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                      <p className="text-white text-xs font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Změnit fotografii</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="text-primary-500" size={32} />
                    </div>
                    <p className="text-sm text-slate-500 font-bold text-center">Vybrat soubor z disku nebo mobilu</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-1">Podporované formáty: JPG, PNG</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800/50">
              <input 
                type="checkbox" 
                id="ai-critique"
                checked={withAI}
                onChange={(e) => setWithAI(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="ai-critique" className="text-sm flex items-center gap-2 cursor-pointer select-none">
                <Sparkles size={16} className="text-primary-500" />
                <span>Získat AI kritiku hned po nahrání</span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isAnalyzing || !file}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 border border-primary-500"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Analyzuji fotografii...
                </>
              ) : (
                'Zveřejnit do soutěže'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
