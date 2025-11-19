
import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ProcessedData, ParticleConfig } from '../types';
import { generateSVG } from '../utils/exporters';

// --- Blender Shortcuts Handler ---
const BlenderShortcuts = () => {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if input fields are not focused
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      const orbit = controls as any;
      if (!orbit) return;
      
      // Distance to maintain when switching views
      const currentDist = camera.position.distanceTo(orbit.target);
      const dist = Math.max(currentDist, 400); 

      switch(e.key) {
        case '1': // Front
        case 'End':
          orbit.setAzimuthalAngle(0);
          orbit.setPolarAngle(Math.PI / 2);
          camera.position.set(0, 0, dist);
          orbit.update();
          break;
        case '3': // Right
        case 'PageDown':
          orbit.setAzimuthalAngle(-Math.PI / 2);
          orbit.setPolarAngle(Math.PI / 2);
          camera.position.set(dist, 0, 0);
          orbit.update();
          break;
        case '7': // Top
        case 'Home':
          orbit.setAzimuthalAngle(0);
          orbit.setPolarAngle(0); // Top down
          camera.position.set(0, dist, 0);
          orbit.update();
          break;
        case '9': // Back (Blender calls this 'Invert' typically with Ctrl, but 9 is good for 'Opposite')
          orbit.setAzimuthalAngle(Math.PI);
          orbit.setPolarAngle(Math.PI / 2);
          camera.position.set(0, 0, -dist);
          orbit.update();
          break;
        case '0': // Camera / Reset
          orbit.reset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera, controls]);

  return null;
};

// --- Export Handler Component ---
const ExportHandler = ({ 
  exportRef, 
  data 
}: { 
  exportRef: React.MutableRefObject<any>, 
  data: ProcessedData | null 
}) => {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (exportRef) {
      exportRef.current.exportSVG = () => {
        if (!data) return;
        generateSVG(data, camera, { width: gl.domElement.width, height: gl.domElement.height });
      };
    }
  }, [camera, gl, data, exportRef]);

  return null;
};

interface SceneContentProps {
  data: ProcessedData;
  config: ParticleConfig;
}

const SceneContent: React.FC<SceneContentProps> = ({ data, config }) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate textures for different shapes
  const textures = useMemo(() => {
    const createTexture = (drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawFn(ctx, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    return {
      circle: createTexture((ctx, w, h) => {
        const cx = w / 2;
        const cy = h / 2;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, w / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }),
      square: createTexture((ctx, w, h) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillRect(4, 4, w - 8, h - 8);
        ctx.shadowColor = "white";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.strokeRect(4,4, w-8, h-8);
      }),
      diamond: createTexture((ctx, w, h) => {
        const cx = w / 2;
        const cy = h / 2;
        ctx.translate(cx, cy);
        ctx.rotate((45 * Math.PI) / 180);
        ctx.translate(-cx, -cy);
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        const size = w * 0.6;
        const offset = (w - size) / 2;
        ctx.fillRect(offset, offset, size, size);
      }),
    };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    geo.computeBoundingSphere();
    return geo;
  }, [data]);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();
      pointsRef.current.rotation.y = Math.sin(time * 0.05) * 0.08;
      pointsRef.current.rotation.z = Math.cos(time * 0.03) * 0.03;
    }
  });

  return (
    <Center>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          map={textures[config.shape]}
          size={config.size}
          vertexColors
          sizeAttenuation={true}
          transparent={true}
          alphaTest={0.01} 
          opacity={config.opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </Center>
  );
};

interface ParticleSceneProps {
  data: ProcessedData | null;
  config: ParticleConfig;
  exportRef?: React.MutableRefObject<any>;
}

const ParticleScene: React.FC<ParticleSceneProps> = ({ data, config, exportRef }) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-[#020205] via-[#080c18] to-[#050505]">
      <Canvas gl={{ antialias: false, stencil: false, depth: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 600]} fov={50} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true} 
          autoRotate={true}
          autoRotateSpeed={0.3}
          maxDistance={2000}
          minDistance={10}
          target={[0,0,0]}
          makeDefault
        />
        
        {/* Helper for Blender shortcuts */}
        <BlenderShortcuts />
        
        {/* Handler for exporting SVG */}
        {exportRef && <ExportHandler exportRef={exportRef} data={data} />}

        <ambientLight intensity={0.2} />
        
        {data ? (
          <SceneContent data={data} config={config} />
        ) : (
           <group>
             <mesh rotation={[0.5, 0.5, 0]}>
              <boxGeometry args={[50, 50, 50]} />
              <meshBasicMaterial color="#222" wireframe />
             </mesh>
             <gridHelper args={[200, 20, 0x333333, 0x111111]} position={[0, -50, 0]} />
           </group>
        )}

        <EffectComposer multisampling={0} disableNormalPass={true}>
          <DepthOfField 
            focusDistance={config.focus} 
            focalLength={0.02} 
            bokehScale={config.aperture} 
            height={480} 
          />
          <Bloom 
            luminanceThreshold={0.3} 
            luminanceSmoothing={0.9} 
            height={300} 
            intensity={1.5} 
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
      
      <div className="absolute bottom-4 left-4 text-xs text-white/20 pointer-events-none font-mono">
        RENDER ENGINE: WEBGL 2.0 | POST-FX: ACTIVE | KEYBOARD SHORTCUTS ENABLED
      </div>
    </div>
  );
};

export default ParticleScene;
