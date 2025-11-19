
import React, { useState } from 'react';
import { ParticleConfig, ParticleShape, Language } from '../types';
import { translations } from '../utils/translations';
import { Upload, Settings, Zap, ChevronLeft, Circle, Square, Diamond, Camera, Command, Globe, Download, FileBox, Eraser } from 'lucide-react';

interface ControlsProps {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  onUpload: (files: File[]) => void;
  isProcessing: boolean;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onExportSVG: () => void;
  onExportPLY: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  config, 
  setConfig, 
  onUpload, 
  isProcessing,
  isVisible,
  setIsVisible,
  lang,
  setLang,
  onExportSVG,
  onExportPLY
}) => {
  const t = translations[lang];
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isProcessing) return;

    const files = Array.from(e.dataTransfer.files).filter((file: File) => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      onUpload(files);
    }
  };

  const updateConfig = (key: keyof ParticleConfig, value: number | string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="absolute top-4 left-4 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white shadow-2xl hover:bg-white/10 transition-all z-20 group"
        title={t.expand}
      >
        <Settings size={24} className="text-gray-300 group-hover:text-white group-hover:rotate-90 transition-transform duration-500" />
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-white shadow-2xl z-20 max-h-[90vh] overflow-y-auto scrollbar-hide animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{t.title}</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            title="Switch Language / 切换语言"
          >
            <Globe size={18} />
            <span className="ml-1 text-[10px] font-bold">{lang.toUpperCase()}</span>
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title={t.collapse}
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <label 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-28 border border-dashed rounded-xl cursor-pointer transition-all group relative overflow-hidden ${
            isDragging 
              ? 'border-cyan-400 bg-cyan-500/20 scale-[1.02] shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
              : 'border-white/20 hover:border-cyan-400/50 hover:bg-cyan-500/5'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
          <div className="flex flex-col items-center justify-center pt-2 pb-3 relative z-10 pointer-events-none">
            <Upload className={`w-6 h-6 mb-2 transition-colors ${isDragging ? 'text-cyan-300' : 'text-gray-400 group-hover:text-cyan-400'}`} />
            <p className={`mb-1 text-xs transition-colors ${isDragging ? 'text-cyan-100' : 'text-gray-400 group-hover:text-white'}`}>
              <span className="font-semibold">{t.upload.title}</span>
            </p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider">{t.upload.desc}</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple
            onChange={handleFileChange}
            disabled={isProcessing} 
          />
        </label>
        {isProcessing && (
          <div className="mt-2 text-center text-[10px] uppercase tracking-wider text-cyan-400 animate-pulse">
            {t.upload.processing}
          </div>
        )}
      </div>

      {/* Shape Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          <span>{t.shape.title}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['circle', 'square', 'diamond'] as ParticleShape[]).map((shape) => (
            <button
              key={shape}
              onClick={() => updateConfig('shape', shape)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                config.shape === shape 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                  : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-gray-300'
              }`}
            >
              {shape === 'circle' && <Circle size={18} />}
              {shape === 'square' && <Square size={18} />}
              {shape === 'diamond' && <Diamond size={18} />}
              <span className="text-[10px] mt-1 capitalize">
                {shape === 'circle' && t.shape.circle}
                {shape === 'square' && t.shape.square}
                {shape === 'diamond' && t.shape.diamond}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls Section */}
      <div className="space-y-5">
        {/* Lens & Focus */}
        <div>
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            <Camera size={14} />
            <span>{t.optics.title}</span>
          </div>
          
          <div className="space-y-4 p-3 bg-black/40 rounded-xl border border-white/5">
             {/* Focus */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>{t.optics.focus}</span>
                <span className="text-cyan-400">{config.focus.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.focus}
                onChange={(e) => updateConfig('focus', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
             {/* Aperture */}
             <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>{t.optics.aperture}</span>
                <span className="text-purple-400">{config.aperture.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={config.aperture}
                onChange={(e) => updateConfig('aperture', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        </div>


        {/* Geometry Config */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            <Settings size={14} />
            <span>{t.geometry.title}</span>
          </div>

          <div className="space-y-4">
             {/* Density Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>{t.geometry.density}</span>
                <span>{config.density}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={config.density}
                onChange={(e) => updateConfig('density', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Size Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>{t.geometry.size}</span>
                <span>{config.size.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="8"
                step="0.1"
                value={config.size}
                onChange={(e) => updateConfig('size', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Depth Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>{t.geometry.depth}</span>
                <span>{config.depth}</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="10"
                value={config.depth}
                onChange={(e) => updateConfig('depth', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Transparency Threshold (Cutout) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <div className="flex items-center gap-1">
                   <Eraser size={10} />
                   <span>{t.geometry.threshold}</span>
                </div>
                <span className="text-red-400">{config.threshold}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                step="1"
                value={config.threshold}
                onChange={(e) => updateConfig('threshold', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>
        </div>
        
        {/* Export Section */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            <Download size={14} />
            <span>{t.export.title}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExportSVG}
              className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-gray-300 hover:text-white transition-colors border border-white/5"
              title="Export vector graphic"
            >
              <Download size={14} />
              {t.export.svg}
            </button>
            <button
              onClick={onExportPLY}
              className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-gray-300 hover:text-white transition-colors border border-white/5"
              title="Export PLY model for Blender"
            >
              <FileBox size={14} />
              {t.export.ply}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/5 flex gap-3 items-start">
        <Command size={16} className="text-gray-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase">{t.shortcuts.title}</p>
          <p className="text-[10px] text-gray-500 leading-tight">
            <span className="text-gray-300">1</span> {t.shortcuts.front}<br/>
            <span className="text-gray-300">3</span> {t.shortcuts.right}<br/>
            <span className="text-gray-300">7</span> {t.shortcuts.top}<br/>
            <span className="text-gray-300">0</span> {t.shortcuts.reset}<br/>
            <span className="text-gray-300">N</span> {t.shortcuts.ui}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Controls;
