
import React, { useEffect } from 'react';
import { Camera, RotateCcw, Maximize2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  onResetView: () => void;
  onToggleUI: () => void;
  onScreenshot: () => void;
  lang: Language;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, 
  y, 
  visible, 
  onClose, 
  onResetView,
  onToggleUI,
  onScreenshot,
  lang
}) => {
  const t = translations[lang];
  
  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div 
      className="fixed z-50 w-56 bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-white/5 mb-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.context.quickActions}</h3>
      </div>
      
      <button 
        onClick={() => { onResetView(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-left group"
      >
        <RotateCcw size={14} className="text-gray-500 group-hover:text-blue-400" />
        <span>{t.context.resetView}</span>
        <span className="ml-auto text-[10px] text-gray-600 group-hover:text-blue-400/50">Num 0</span>
      </button>

      <button 
        onClick={() => { onToggleUI(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-left group"
      >
        <Maximize2 size={14} className="text-gray-500 group-hover:text-blue-400" />
        <span>{t.context.toggleUI}</span>
        <span className="ml-auto text-[10px] text-gray-600 group-hover:text-blue-400/50">N</span>
      </button>

      <button 
        onClick={() => { onScreenshot(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-left group"
      >
        <Camera size={14} className="text-gray-500 group-hover:text-blue-400" />
        <span>{t.context.screenshot}</span>
      </button>

       <div className="my-1 border-t border-white/5"></div>
       
       <div className="px-4 py-2 text-[10px] text-gray-600">
          <div className="flex justify-between items-center mb-1">
             <span>{t.context.frontView}</span>
             <span className="font-mono bg-white/5 px-1 rounded">1</span>
          </div>
          <div className="flex justify-between items-center mb-1">
             <span>{t.context.rightView}</span>
             <span className="font-mono bg-white/5 px-1 rounded">3</span>
          </div>
          <div className="flex justify-between items-center">
             <span>{t.context.topView}</span>
             <span className="font-mono bg-white/5 px-1 rounded">7</span>
          </div>
       </div>
    </div>
  );
};

export default ContextMenu;