
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 py-12 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          Developed by Filip Holstein | 2026
        </p>
        <div className="mt-4 flex items-center justify-center gap-6">
          <a href="#" className="text-xs text-slate-400 hover:text-primary-500 transition-colors uppercase tracking-widest font-bold">Zásady</a>
          <a href="#" className="text-xs text-slate-400 hover:text-primary-500 transition-colors uppercase tracking-widest font-bold">Kontakt</a>
          <a href="#" className="text-xs text-slate-400 hover:text-primary-500 transition-colors uppercase tracking-widest font-bold">Podpora</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
