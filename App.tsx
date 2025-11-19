
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ParticleScene from './components/ParticleScene';
import Controls from './components/Controls';
import ContextMenu from './components/ContextMenu';
import { ParticleConfig, ProcessedData, Language } from './types';
import { processImagesToParticles } from './utils/imageProcessing';
import { exportToPLY } from './utils/exporters';

const DEFAULT_IMAGE = "https://picsum.photos/800/600"; 

const App: React.FC = () => {
  const [config, setConfig] = useState<ParticleConfig>({
    size: 1.5,       
    density: 3,      
    depth: 150,      
    opacity: 0.85,
    saturation: 1.2,
    shape: 'circle',
    focus: 0.0,      
    aperture: 3.0    
  });

  const [particleData, setParticleData] = useState<ProcessedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([DEFAULT_IMAGE]);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese
  
  // Ref to access scene methods (like SVG export which needs camera)
  const exportRef = useRef<{ exportSVG?: () => void }>({});

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

  // Core processing logic
  const handleProcessImages = useCallback(async (srcs: string[], cfg: ParticleConfig) => {
    setIsProcessing(true);
    try {
      const data = await processImagesToParticles(srcs, cfg.density, cfg.depth, cfg.saturation);
      setParticleData(data);
    } catch (error) {
      console.error("Failed to process images:", error);
      alert(lang === 'zh' ? "图片处理失败，请确保文件格式正确" : "Failed to process images.");
    } finally {
      setIsProcessing(false);
    }
  }, [lang]);

  // Debounce processing when config changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleProcessImages(currentImages, config);
    }, 300); 

    return () => clearTimeout(timer);
  }, [currentImages, config.density, config.depth, config.saturation, handleProcessImages]);

  const handleUpload = (files: File[]) => {
    Promise.all(
      files.map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      }))
    ).then(images => {
      setCurrentImages(images);
    });
  };

  // Global shortcuts (N for UI toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      
      if (e.key.toLowerCase() === 'n') {
        setIsUIVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'nanopixel-scene.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const triggerResetView = () => {
    // Simulate key press for '0' to trigger reset in BlenderShortcuts component
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '0' }));
  };

  const handleExportSVG = () => {
    if (exportRef.current?.exportSVG) {
      exportRef.current.exportSVG();
    }
  };

  const handleExportPLY = () => {
    if (particleData) {
      exportToPLY(particleData);
    }
  };

  return (
    <div 
      className="w-screen h-screen overflow-hidden bg-black font-sans antialiased selection:bg-blue-500/30"
      onContextMenu={handleContextMenu}
    >
      <ParticleScene 
        data={particleData} 
        config={config} 
        exportRef={exportRef}
      />
      
      <Controls 
        config={config} 
        setConfig={setConfig} 
        onUpload={handleUpload} 
        isProcessing={isProcessing}
        isVisible={isUIVisible}
        setIsVisible={setIsUIVisible}
        lang={lang}
        setLang={setLang}
        onExportSVG={handleExportSVG}
        onExportPLY={handleExportPLY}
      />
      
      <ContextMenu 
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        onResetView={triggerResetView}
        onToggleUI={() => setIsUIVisible(prev => !prev)}
        onScreenshot={handleScreenshot}
        lang={lang}
      />

      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(20,30,50,0.2),transparent_80%)]"></div>
    </div>
  );
};

export default App;
