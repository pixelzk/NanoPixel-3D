
import * as THREE from 'three';
import { ProcessedData } from '../types';

export const exportToPLY = (data: ProcessedData) => {
  const vertexCount = data.positions.length / 3;
  
  // PLY Header
  let header = 'ply\n';
  header += 'format ascii 1.0\n';
  header += `element vertex ${vertexCount}\n`;
  header += 'property float x\n';
  header += 'property float y\n';
  header += 'property float z\n';
  header += 'property uchar red\n';
  header += 'property uchar green\n';
  header += 'property uchar blue\n';
  header += 'end_header\n';

  let body = '';
  for (let i = 0; i < vertexCount; i++) {
    const x = data.positions[i * 3];
    const y = data.positions[i * 3 + 1];
    const z = data.positions[i * 3 + 2];
    
    const r = Math.floor(data.colors[i * 3] * 255);
    const g = Math.floor(data.colors[i * 3 + 1] * 255);
    const b = Math.floor(data.colors[i * 3 + 2] * 255);

    body += `${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)} ${r} ${g} ${b}\n`;
  }

  const blob = new Blob([header + body], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nanopixel_model.ply';
  link.click();
  URL.revokeObjectURL(url);
};

export const generateSVG = (
  data: ProcessedData, 
  camera: THREE.Camera, 
  size: { width: number; height: number }
) => {
  camera.updateMatrixWorld();
  const vector = new THREE.Vector3();
  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.width} ${size.height}" style="background-color:black;">`;

  const points = [];

  // Project points
  for (let i = 0; i < data.positions.length; i += 3) {
    // Optimization: Skip some points if too many to prevent browser crash on SVG render
    // For SVG we might want to limit to e.g. 20k points if performance is bad, but let's try full first
    
    vector.set(data.positions[i], data.positions[i + 1], data.positions[i + 2]);
    vector.project(camera);

    // Check if within view (Normalized Device Coordinates are -1 to 1)
    if (vector.z < 1 && vector.x >= -1 && vector.x <= 1 && vector.y >= -1 && vector.y <= 1) {
      const x = (vector.x * widthHalf) + widthHalf;
      const y = -(vector.y * heightHalf) + heightHalf;
      
      const r = Math.floor(data.colors[i] * 255);
      const g = Math.floor(data.colors[i + 1] * 255);
      const b = Math.floor(data.colors[i + 2] * 255);
      
      // Simple radius attenuation based on depth
      // vector.z is depth in NDC (-1 to 1)
      const radius = Math.max(0.5, 3 * (1 - vector.z)); 

      points.push({ x, y, z: vector.z, color: `rgb(${r},${g},${b})`, r: radius });
    }
  }

  // Sort painters algorithm (draw farthest first)
  points.sort((a, b) => b.z - a.z);

  points.forEach(p => {
    svgContent += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}" fill="${p.color}" />`;
  });

  svgContent += '</svg>';

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nanopixel_view.svg';
  link.click();
  URL.revokeObjectURL(url);
};
