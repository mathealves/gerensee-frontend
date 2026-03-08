import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 w-full border-t border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-400">
        <section>
          <span>Gerensee</span>
          <span className="inline-flex items-center bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-full px-1.5 py-0.5 font-semibold text-xs ml-0.5">
            Beta
          </span>
        </section>
        <span>© {year} Matheus S. Alves</span>
      </div>
    </footer>
  );
}
