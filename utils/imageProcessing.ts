
import { ProcessedData } from '../types';

// Reduced max dimension to handle multiple images efficiently without crashing
const MAX_DIMENSION = 600;
const GAP = 60; // Spacing between images in 3D space

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only apply crossOrigin to http/https URLs to avoid issues with local base64 data
    if (src.startsWith('http')) {
      img.crossOrigin = "Anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

export const processImagesToParticles = async (
  imageSrcs: string[],
  step: number = 4, // Process every Nth pixel
  depthMultiplier: number = 50,
  saturation: number = 1.0
): Promise<ProcessedData> => {
  try {
    if (!imageSrcs || imageSrcs.length === 0) {
      throw new Error("No images provided");
    }

    // 1. Load all images in parallel
    const images = await Promise.all(imageSrcs.map(src => loadImage(src)));
    
    interface ImageMeta {
      img: HTMLImageElement;
      width: number;
      height: number;
      xOffset: number;
    }

    // 2. Calculate Dimensions & Layout
    const metas: ImageMeta[] = [];
    let totalWidth = 0;
    let maxHeight = 0;

    for (const img of images) {
      let w = img.width;
      let h = img.height;

      // Resize logic to prevent massive particle counts
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
        w = Math.floor(w * ratio);
        h = Math.floor(h * ratio);
      }
      
      // Ensure minimum 1x1
      w = Math.max(1, w);
      h = Math.max(1, h);

      metas.push({
        img,
        width: w,
        height: h,
        xOffset: 0 // Placeholder, calculated below
      });

      totalWidth += w;
      maxHeight = Math.max(maxHeight, h);
    }

    // Add gaps between images
    if (metas.length > 1) {
      totalWidth += (metas.length - 1) * GAP;
    }

    // Calculate X offsets to center the entire group at (0,0,0)
    let currentX = -totalWidth / 2;
    for (const meta of metas) {
      // Align image center to current position
      meta.xOffset = currentX + (meta.width / 2);
      currentX += meta.width + GAP;
    }

    // 3. Generate Particles
    const positions: number[] = [];
    const colors: number[] = [];
    const volumeNoise = 5.0; 

    // Shared canvas for processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) throw new Error("Canvas context not available");

    for (const meta of metas) {
      canvas.width = meta.width;
      canvas.height = meta.height;
      
      ctx.clearRect(0, 0, meta.width, meta.height);
      ctx.drawImage(meta.img, 0, 0, meta.width, meta.height);
      
      const imageData = ctx.getImageData(0, 0, meta.width, meta.height).data;

      // Center offsets relative to the specific image's center
      const cx = meta.width / 2;
      const cy = meta.height / 2;

      for (let y = 0; y < meta.height; y += step) {
        for (let x = 0; x < meta.width; x += step) {
          const i = (y * meta.width + x) * 4;
          
          // Bounds check
          if (i + 3 >= imageData.length) continue;

          const a = imageData[i + 3];
          // Skip transparent pixels (threshold set to 10 to be safe)
          if (a < 10) continue;

          const r = imageData[i] / 255;
          const g = imageData[i + 1] / 255;
          const b = imageData[i + 2] / 255;

          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

          // --- Position Calculation ---
          // X: (LocalX - LocalCenter) + GlobalOffset
          const posX = (x - cx) + meta.xOffset;
          const posY = -(y - cy); // Invert Y for 3D world space
          
          const zNoise = (Math.random() - 0.5) * volumeNoise;
          const posZ = ((brightness - 0.5) * depthMultiplier) + zNoise;

          positions.push(posX, posY, posZ);

          // --- Color Calculation ---
          // Apply Saturation Boost
          let sr = brightness + (r - brightness) * saturation;
          let sg = brightness + (g - brightness) * saturation;
          let sb = brightness + (b - brightness) * saturation;

          // Clamp values 0-1
          sr = Math.min(1, Math.max(0, sr));
          sg = Math.min(1, Math.max(0, sg));
          sb = Math.min(1, Math.max(0, sb));

          colors.push(sr, sg, sb);
        }
      }
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      width: totalWidth,
      height: maxHeight
    };

  } catch (error) {
    console.error("Image processing failed:", error);
    throw error;
  }
};
