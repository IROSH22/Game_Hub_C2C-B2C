import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-2xl shadow-cyan-500/40 border border-cyan-300/50 transition-all hover:scale-110 active:scale-95 animate-in fade-in zoom-in-75 duration-200 cursor-pointer flex items-center justify-center group"
      title="Back to Top"
      aria-label="Scroll back to top"
    >
      <ArrowUp className="w-5 h-5 text-slate-950 group-hover:-translate-y-1 transition-transform stroke-[2.5]" />
    </button>
  );
};
