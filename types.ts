
export type ParticleShape = 'circle' | 'square' | 'diamond';
export type Language = 'zh' | 'en';

export interface ParticleConfig {
  size: number;
  density: number; // Step size (smaller is denser)
  depth: number;   // Z-axis displacement strength
  opacity: number;
  saturation: number; // Color intensity booster
  shape: ParticleShape; // New: Particle shape
  focus: number; // New: Depth of field focus distance
  aperture: number; // New: Depth of field blur strength
}

export interface ProcessedData {
  positions: Float32Array;
  colors: Float32Array;
  width: number;
  height: number;
}